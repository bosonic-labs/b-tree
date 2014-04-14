(function () {
    var BTreePrototype = Object.create(HTMLElement.prototype, {
            isChildrenOf: {
                enumerable: true,
                value: function (node, parent) {
                    var isChildren = false;
                    while (node && !isChildren) {
                        isChildren = node === parent;
                        node = node.parentNode;
                    }
                    return isChildren;
                }
            },
            getParentLi: {
                enumerable: true,
                value: function (node) {
                    var li = null;
                    while (node && !li) {
                        if (node.nodeName === 'LI') {
                            li = node;
                        } else {
                            node = node.parentNode;
                        }
                    }
                    return li;
                }
            },
            createdCallback: {
                enumerable: true,
                value: function () {
                    var lis = this.querySelectorAll('li');
                    var handle = document.createElement('a');
                    handle.classList.add('handle');
                    handle.setAttribute('href', '#');
                    handle.innerHTML = '|| - ';
                    Array.prototype.forEach.call(lis, function (li) {
                        li.insertBefore(handle.cloneNode(true), li.firstChild);
                        li.setAttribute('draggable', 'true');
                    });
                    this.bindEvent();
                }
            },
            attachedCallback: {
                enumerable: true,
                value: function () {
                    this.appendChild(this.template.content.cloneNode(true));
                    this.dropIndicator = this.querySelector('.cursor');
                }
            },
            bindEvent: {
                enumerable: true,
                value: function () {
                    this.addEventListener('dragstart', this.onDragStart.bind(this), false);
                    this.addEventListener('dragover', this.onDragOver.bind(this), false);
                    this.addEventListener('dragenter', this.onDragEnter.bind(this), false);
                    this.addEventListener('dragend', this.onDragEnd.bind(this), false);
                    this.addEventListener('drop', this.onDrop.bind(this), false);
                }
            },
            onDragStart: {
                enumerable: true,
                value: function (e) {
                    this.dragSrcEl = this.getParentLi(e.target);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('Text', this.dragSrcEl.innerHTML);
                }
            },
            getInsertPoint: {
                enumerable: true,
                value: function (overedNode, mouseY) {
                    var node = overedNode;
                    if (!this.isChildrenOf(node, this.dragSrcEl)) {
                        if (node.nodeName === 'UL') {
                            var list = node.children;
                            var y = mouseY;
                            var match = false;
                            var iterator = 0;
                            while (!match && iterator < list.length) {
                                var li = list[iterator];
                                var currentY = li.offsetTop;
                                if (y < currentY) {
                                    match = li;
                                    this.dropIndicator.classList.remove('hidden');
                                    this.dropIndicator.style.top = li.offsetTop + 'px';
                                    this.dropIndicator.querySelector('.marker').style.left = node.offsetLeft + 'px';
                                    setTimeout(function () {
                                    }, 1000);
                                }
                                iterator++;
                            }
                            return li;
                        } else {
                            this.dropIndicator.classList.remove('hidden');
                            this.dropIndicator.style.top = node.offsetTop + node.offsetHeight + 'px';
                            this.dropIndicator.querySelector('.marker').style.left = node.offsetLeft + 'px';
                            return node;
                        }
                    }
                }
            },
            onDragOver: {
                enumerable: true,
                value: function (e) {
                    e.preventDefault();
                    if (this.isChildrenOf(this.getParentLi(e.target), this.dragSrcEl)) {
                        e.dataTransfer.dropEffect = 'none';
                    } else {
                        e.dataTransfer.dropEffect = 'move';
                        var node = e.target;
                        if (node.nodeName === '#text') {
                            node = node.parentNode;
                        }
                        if (node.classList.contains('cursor')) {
                            node = this.querySelector('ul');
                        }
                        this.getInsertPoint(node, e.clientY);
                    }
                }
            },
            onDragEnter: {
                enumerable: true,
                value: function (e) {
                }
            },
            onDragEnd: {
                enumerable: true,
                value: function (e) {
                    this.dropIndicator.classList.add('hidden');
                }
            },
            onDrop: {
                enumerable: true,
                value: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var node = e.target;
                    if (node.nodeName === 'A') {
                        node = node.parentNode;
                    }
                    if (node.classList.contains('cursor')) {
                        node = this.querySelector('ul');
                    }
                    if (this.isChildrenOf(node, this.dragSrcEl)) {
                        return;
                    }
                    if (node.classList.contains('dragging')) {
                        return;
                    }
                    switch (node.nodeName) {
                    case 'LI':
                        if (!node.querySelector('ul')) {
                            var ul = document.createElement('ul');
                            node.appendChild(ul);
                        }
                        this.dragSrcEl.parentNode.removeChild(this.dragSrcEl);
                        node.querySelector('ul').appendChild(this.dragSrcEl);
                        break;
                    case 'UL':
                        var insertBeforeNode = this.getInsertPoint(node, e.clientY);
                        if (insertBeforeNode === this.dragSrcEl) {
                            return;
                        }
                        this.dragSrcEl.parentNode.removeChild(this.dragSrcEl);
                        node.insertBefore(this.dragSrcEl, insertBeforeNode);
                        break;
                    }
                    this.dragSrcEl = null;
                }
            }
        });
    window.BTree = document.registerElement('b-tree', { prototype: BTreePrototype });
    Object.defineProperty(BTreePrototype, 'template', {
        get: function () {
            var fragment = document.createDocumentFragment();
            var div = fragment.appendChild(document.createElement('div'));
            div.innerHTML = ' <div class="cursor hidden"> <div class="marker"></div> </div> ';
            while (child = div.firstChild) {
                fragment.insertBefore(child, div);
            }
            fragment.removeChild(div);
            return { content: fragment };
        }
    });
}());