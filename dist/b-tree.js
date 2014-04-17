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
            getFirstParentTarget: {
                enumerable: true,
                value: function (node) {
                    if (node.classList.contains('cursor') || node.classList.contains('marker')) {
                        return this.querySelector('ul');
                    }
                    var parent = null;
                    while (node && !parent) {
                        if (node.nodeName === 'UL' || node.nodeName === 'LI') {
                            parent = node;
                        }
                        node = node.parentNode;
                    }
                    return parent;
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
                    handle.classList.add('toggle-collapse');
                    handle.setAttribute('href', '#');
                    handle.innerHTML = '>';
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
                    this.addEventListener('dragleave', this.onDragLeave.bind(this), false);
                    this.addEventListener('dragend', this.onDragEnd.bind(this), false);
                    this.addEventListener('drop', this.onDrop.bind(this), false);
                    this.addEventListener('click', this.onToggleCollapseClick.bind(this), false);
                }
            },
            onToggleCollapseClick: {
                enumerable: true,
                value: function (e) {
                    if (!e.target.classList.contains('toggle-collapse')) {
                        return;
                    }
                    e.preventDefault();
                    var li = this.getParentLi(e.target);
                    var ul = li.querySelector('ul');
                    if (ul.classList.contains('collapsed')) {
                        ul.classList.remove('collapsed');
                        li.classList.remove('collapsed');
                    } else {
                        ul.classList.add('collapsed');
                        li.classList.add('collapsed');
                    }
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
                value: function (hoveredNode, mouseY) {
                    var parent = this.getFirstParentTarget(hoveredNode);
                    if (!parent) {
                        return null;
                    }
                    if (this.isChildrenOf(hoveredNode, this.dragSrcEl)) {
                        return null;
                    }
                    if (parent.nodeName === 'UL') {
                        var list = parent.children;
                        var match = false;
                        var iterator = 0;
                        while (!match && iterator < list.length) {
                            var li = list[iterator];
                            var currentY = li.offsetTop;
                            if (mouseY < currentY) {
                                match = li;
                                this.dropIndicator.classList.remove('hidden');
                                this.dropIndicator.style.top = li.offsetTop - 7.5 + 'px';
                                this.dropIndicator.querySelector('.marker').style.left = li.offsetLeft - 10 + 'px';
                                setTimeout(function () {
                                }, 1000);
                            }
                            iterator++;
                        }
                        return li;
                    } else {
                        this.dropIndicator.classList.add('hidden');
                        return parent;
                    }
                }
            },
            onDragOver: {
                enumerable: true,
                value: function (e) {
                    e.preventDefault();
                    var node = this.getFirstParentTarget(e.target);
                    if (this.isChildrenOf(node, this.dragSrcEl)) {
                        e.dataTransfer.dropEffect = 'none';
                    } else {
                        e.dataTransfer.dropEffect = 'move';
                        if (node === null) {
                            console.log(e.target, node);
                        }
                        this.getInsertPoint(node, e.clientY);
                    }
                }
            },
            onDragEnter: {
                enumerable: true,
                value: function (e) {
                    e.preventDefault();
                    if (e.target.nodeName !== 'UL') {
                        var li = this.getParentLi(e.target);
                        console.log('enter', li);
                        if (li) {
                            li.classList.add('drag-over');
                        }
                    }
                }
            },
            onDragLeave: {
                enumerable: true,
                value: function (e) {
                    e.preventDefault();
                    if (e.target.nodeName !== 'UL') {
                        var li = this.getParentLi(e.target);
                        console.log('leave', li);
                        if (li) {
                            li.classList.remove('drag-over');
                        }
                    }
                }
            },
            onDragEnd: {
                enumerable: true,
                value: function (e) {
                    this.dropIndicator.classList.add('hidden');
                    var hovered = this.querySelector('.drag-over');
                    if (hovered) {
                        hovered.classList.remove('drag-over');
                    }
                }
            },
            onDrop: {
                enumerable: true,
                value: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var node = this.getFirstParentTarget(e.target);
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