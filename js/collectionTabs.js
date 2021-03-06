CT = {

    taskId: '',
    taskIndex: '',
    tabId: '',
    tab: '',
    tabActive: '',
    prevTabIndex: [],
    inputFocus: false,
    _openCollectionNOWClickTime: new Date(),
    lastCollectionId: '',
    lastCollectionIndex: 0,

    start() {
        say.m('CT.start()')
        CT.prevTabIndex = []
        CT.selectFirstTabOnStart()
        CT.taskId = tabState.selectedTask
        CT.add5()
        CT.loadTasks()
        CT.render()
        CT.events()
        CT.lastCollectionId = tabState.tasks[0].id
    },
    events() {
        say.m('CT.events()')

        document.getElementById('collection-tabs').addEventListener('click', function (e) {
            CT.goToCollection(e)

        })
        document.querySelector('.page-tabs').addEventListener('click', function (e) {
            CT.remoteClassEditing()
        })
        let taskName = document.querySelectorAll('.task-action-container .task-name')
        for (var i = 0; i < taskName.length; i++) {
            taskName[i].addEventListener('click', function (event) {
                CT.overviewTaskNameClickE(event)
            })
            taskName[i].addEventListener('keydown', function (e) {
                CT.overviewTaskNameClickEnterE(e)
            })
        }
    },

    goToCollection(e) {
        say.m('CT.goToCollection(e):')

        taskOverlay.inputFocus = true
        CT.add5tab()
        // click on collection tabs
        try {

            if (e.target.parentNode.parentNode.id == 'collection-tabs') {
                if (e.target.parentNode.className.indexOf("active-tab") == -1) {
                    tabState.selectedTask = e.target.parentNode.dataset.taskId.trim()
                    switchToTask(e.target.parentNode.dataset.taskId.trim())
                    sessionRestore.save()
                    CT.render()
                    for (let i = 0; i < tabState.tasks.length; i++) {
                        if (tabState.tasks[i].id == tabState.selectedTask) {
                            if (tabState.tasks[i].name == null) {
                                // CT.addClassEditing()
                                document.querySelector('.active-tab').addEventListener('blur', function (e) {
                                    CT._openCollectionNOWClick(e)
                                    CT.remoteClassEditing()
                                    modals.hide()
                                }, true);

                                // modals.show('collection')
                            }
                        }
                    }
                } else {
                    CT.addClassEditing()
                    document.querySelector('.active-tab').addEventListener('blur', function (e) {
                        CT._openCollectionNOWClick(e)
                        CT.remoteClassEditing()
                        modals.hide()
                    }, true);
                    modals.show('collection')
                }
            }
        } catch (e) {
        }
        // edit name collection tabs
        document.querySelector('.active-tab input').addEventListener('keydown', function (e) {
            if (e.which == 13) {
                for (let i = 0; i < tabState.tasks.length; i++) {
                    if (tabState.tasks[i].id == e.target.getAttribute('data-id')) {
                        tabState.tasks[i].name = e.target.value
                    }
                }
                sessionRestore.save()
                CT.render()
            }
        })
        CT.add5tab()
        eventEmitter.emit('goToCollection')
    }, _openCollectionNOWClick(e) {
        say.m('CT._openCollectionNOWClick(e)')

        if (CT._openCollectionNOWClickTime + 5 < new Date() + 1) {
            try {
                if (e.relatedTarget.classList.value == 'openCollectionNOW') {

                    let colName = e.relatedTarget.innerText
                    let arrLinks = e.relatedTarget.getAttribute("data-links").split(",")
                    let id = ''
                    if(tab._collectionHasName(tab._getIdSelectCollection()) == true || tab._collectionHasUsedTab(tab._getIdSelectCollection()) == true){
                        id = tasks.addEmpty({name: colName})
                    } else {
                        id = tab._getIdSelectCollection()
                        tab._setCollectionName(tab._getIdSelectCollection(), colName)
                    }
                    switchToTask(id)
                    sessionRestore.save()
                    CT.render()
                    for (let i = 0; i < tabState.tasks.length; i++) {
                        if (tabState.tasks[i].id == id) {
                            for (let j = 0; j < tabState.tasks[i].tabs.length; j++) {
                                if (arrLinks[j]) {
                                    tabState.tasks[i].tabs[j].url = arrLinks[j].split(":")[0]
                                    tabState.tasks[i].tabs[j].title = arrLinks[j].split(":")[1]
                                }
                            }
                        }
                    }
                    rerenderTabstrip()
                    switchToTask(id)
                    if (arrLinks.length > 0) {
                        openURLFromsearchbar('', arrLinks[0].split(":")[0])
                        setTimeout(function () {
                            modals.hide()
                            switchToTab(tabState.tasks[0].tabs[0].id)
                        }, 0)
                    }



                }
            } catch (e) {
            }
            CT._openCollectionNOWClickTime = new Date() + 1
        }
    },
    goToCollectionID(id) {
        say.m('CT.goToCollectionID(id): ' + id)

        try {
            let index = CT.getIndexFromIdTaskId(id)
            if (index == 0) {
                switchToTask(tabState.tasks[index].id)
            } else {
                switchToTask(tabState.tasks[index - 1].id)
            }
            CT.render()
        } catch (e) {
            CT.render()
            taskOverlay.inputFocus = false
        }

    },
    getIndexFromIdTaskId(id) {
        say.m('CT.getIndexFromIdTaskId(id): ' + id)

        let index = ''
        for (let i = 0; i < tabState.tasks.length; i++) {
            console.log(tabState.tasks[i].id)
            if (tabState.tasks[i].id == id) {
                index = i
            }
        }
        console.log('id: ' + id, 'index: ' + index)
        return index
    },
    addClassEditing() {
        document.querySelector('.active-tab input').disabled = false
        document.querySelector('.active-tab input').select()
        document.querySelector('.active-tab').className += ' editing'
        document.querySelector('.active-tab input').placeholder = 'Enter collection name'
    },
    remoteClassEditing() {
        say.m('CT.remoteClassEditing()')

        try {
            if (document.querySelector('.active-tab ').className.indexOf("editing") != -1) {
                document.querySelector('.active-tab ').classList.remove("editing");
                document.querySelector('.active-tab input').placeholder = '●●●'
                CT.remoteClassEditing()
            }
        } catch (e) {
        }
    },
    getDataFromE(e) {
        say.m('CT.getDataFromE(e)' + e)

        if (e.target.type == 'text') {
            CT.taskId = e.target.parentElement.dataset.taskId
            CT.taskIndex = e.target.parentElement.dataset.index
        } else {
            CT.taskId = e.target.dataset.taskId
            CT.taskIndex = e.target.dataset.index
        }

        CT.tabId = tabState.tasks[CT.taskIndex].tabs[0].id

        CT.tab = document.querySelector('[data-tab="' + CT.taskIndex + '"]')
        CT.tabActive = document.querySelector('.active-tab.collection-tab')

        CT.prevTabIndex.push(CT.taskIndex) // history tabs

        tabState.selectedTask = tabState.tasks[CT.prevTabIndex[CT.prevTabIndex.length - 1]].id

    },
    selectFirstTabOnStart() {
        tabState.selectedTask = tabState.tasks[0].id
        switchToTask(tabState.selectedTask)
        sessionRestore.save()
    },
    loadTasks() {
        tasks.get().forEach(function (task, index) {
            var el = getTaskElement(task, index)
            taskContainer.appendChild(el)
            taskOverlay.dragula.containers.push(el.getElementsByClassName('task-tabs-container')[0])
        })
    },
    clickOnFirstCollection() {
        document.querySelector('[data-task-id="' + tasks.get()[0].id + ' "]').click()
    },
    add5() {
        say.m('CT.add5()')
        if (tabState.tasks.length < 5) {
            let id = tabState.selectedTask
            for (let i = tabState.tasks.length; i != 5; i++) {
                tasks.add()
            }
        }
    },
    add5tab() {
        say.m('CT.add5tab()')

        for (let i = 0; i < tabState.tasks.length; i++) {
            if (tabState.tasks[i].id == tabState.selectedTask) {
                for (let j = tabState.tasks[i].tabs.length; j < 5; j++) {
                    addTab(tabs.add({url: ''}, tabs[0]), {enterEditMode: false})
                }
            } else {
                if (tabState.tasks[i].tabs.length == 1 && tabState.tasks[i].tabs[0].url == 'duckduckgo.com') {
                    tabState.tasks[i].tabs[0].url = ''
                    tabState.tasks[i].tabs[0].title = ''
                }
            }
        }
    },
    addEmptyTabStyle() {
        say.m('CT.addEmptyTabStyle()')

        // alert()
        //
        // let tabViewContents = document.querySelectorAll('.tab-view-contents')
        // for (let i = 0; i < tabViewContents.length; i++) {
        //     if (tabViewContents[i].querySelector('.title').innerText == '...' && !tabViewContents[i].classList.contains('addEmptyTabStyle')) {
        //         tabViewContents[i].className += " addEmptyTabStyle"
        //     } else if (tabViewContents[i].classList.contains('addEmptyTabStyle')) {
        //         tabViewContents[i].classList.remove('addEmptyTabStyle');
        //     }
        // }



    },
    overviewTaskNameClickEnterE(e) {
        say.m('CT.overviewTaskNameClickEnterE()')
        console.log('task')
        let id = e.target.parentElement.parentElement.getAttribute('data-task')
        let eTarget = e.target
        let eVal = e.target.value
        if (e.which == 13) {
            CT.render()
            for (let i = 0; i < tasks.get().length; i++) {
                if (tasks.get()[i].id == id) {
                    if (i <= 5) {
                        document.querySelector(`[data-index="${i}"]`).click()
                    }
                }
            }
        }
    },
    overviewTaskNameClickE(e) {
        say.m('CT.overviewTaskNameClickE()')

        let id = e.target.parentElement.parentElement.getAttribute('data-task')
        for (let i = 0; i < tasks.get().length; i++) {
            if (tasks.get()[i].id == id) {
                if (i <= 5) {
                    CT.collectionTopClickOnCollectionTab(i)
                    CT.collectionLeftFocusOnCollectionTabInput(id)
                }
            }
        }
    },

    collectionTopClickOnCollectionTab(index) {
        document.querySelector(`[data-index="${index}"]`).click()
    },
    collectionTopRemoveBGSelectedAll() {
        let elems = document.querySelectorAll(".active-tab");
        for (var i = 0; i < elems.length; i++)
            elems[i].classList.remove('active-tab');
    },
    collectionTopAddBGSelected(index) {
        CT.collectionTopRemoveBGSelectedAll()
        document.querySelector(`[data-index="${index}"]`).classList.add('active-tab')
    },
    collectionTopAddBGSelectedById(id_) {
        CT.collectionTopRemoveBGSelectedAll()
        document.querySelector(`[data-task-id="${id_} "]`).classList.add('active-tab')
    },
    collectionLeftFocusOnCollectionTabInput(id) {
        document.querySelector(`[data-task="${id}"] input`).focus()
    },
    _getLastCollection() {

        let S_LC_I = CT.lastCollectionIndex
        let S_LC_ID = CT.lastCollectionId
        CT.lastCollectionId = tabState.selectedTask
        for (let i = 0; i < tabState.tasks.length; i++) {
            if (tabState.tasks[i].id == tabState.selectedTask) {
                CT.lastCollectionIndex = i
            }
        }
        let F_LC_I = CT.lastCollectionIndex
        let F_LC_ID = CT.lastCollectionId

        if (S_LC_I <= 4 && F_LC_I > 4) {
            CT._needMoveColection(S_LC_I, F_LC_ID, F_LC_I)
        }

    }, _needMoveColection(from, whoID, whoINDEX) {

        let tempEl = tabState.tasks[whoINDEX]
        tabState.tasks.splice(whoINDEX, 1)
        tabState.tasks.splice(from, 0, tempEl)
    },

    render() {
        say.m('CT.render()')

        CT._getLastCollection()


        CT.add5tab()
        if (CT.inputFocus == false) {
            let collectionTabsHTML = []
            for (let i = 0; i < tabState.tasks.length; i++) {
                let val = tabState.tasks[i].name
                if (val == null || val == 'null')
                    val = ''
                let title = `<input placeholder="&#9679;&#9679;&#9679;" type="text" class="collectionTabInput" data-id="${tabState.tasks[i].id}" value="${val}" disabled="true">` || `<input type="text" placeholder="&#9679;&#9679;&#9679;" class="collectionTabInput" data-id="${tabState.tasks[i].id}" value="${val}"  placeholder="Enter collection name" disabled="true"> <svg width="23.9px" height="5.6px">23.9 5.6 <use xlink:href="icons/svg/miniature-controls.svg#ellipsis-big"></use></svg>`
                collectionTabsHTML.push('<div class="collection-tab ' + ( tabState.selectedTask == tabState.tasks[i].id ? 'active-tab' : '' ) + '" data-task-id="' + tabState.tasks[i].id + ' " data-index="' + i + '">' + title + '</div>')
            }
            document.getElementById('collection-tabs').innerHTML = collectionTabsHTML.join('')
            CT.renderOverlay()
            eventEmitter.emit('render')
        }
    },
    renderOverlay() {
        say.m('CT.renderOverlay() ' + taskOverlay.inputFocus)

        eventEmitter.emit('renderOverlay')
        if (taskOverlay.inputFocus) {
            if (document.querySelector('#task-overlay').getAttribute('hidden') == null)
                taskOverlay.show()
        }
        eventEmitter.emit('render')
    }

}
CT.start()





