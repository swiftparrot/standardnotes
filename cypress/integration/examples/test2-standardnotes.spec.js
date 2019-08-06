// <reference types="Cypress" />

describe('Test cases for Standardnotes app', () => {


    beforeEach(() => {
        login()
        cy.visit('/')
        indexedDB.deleteDatabase('standardnotes')       
    });


    it('Tags Column - Verify all labels', () => {

        cy.get('div.title > span.sk-bold')
        .should(($span) => {
            expect($span).to.contain('Views')
            expect($span).to.contain('Tags')
        })

        getElementScope('div#tags-column div#tags-content input.title:first')
            .its('tag.title')
            .should('contain','All notes')

        cy.get('div.sk-button.sk-secondary-contrast')
            .should('have.attr','title','Create a new tag')    
    });


    it('Notes Column - Verify All labels displayed', () => {

        cy.get('div#notes-column div#notes-title-bar')
            .contains('All notes')
        cy.get('div#notes-column div#notes-title-bar  div.sk-button.contrast')
            .should('have.attr','title','Create a new note in the selected tag')

        cy.get('div#notes-column input#search-bar')
            .should('have.attr','placeholder','Search')

        cy.get('div#notes-column div#notes-menu-bar')
            .contains('Options')
        cy.get('div#notes-column div#notes-menu-bar')
            .contains('Date Added') 
    });

    it('Notes Column - Verify all labels when you click on the Options link', () => {

        cy.get('div#notes-column div#notes-menu-bar')
            .contains('Options')
            .click()

        cy.get('div#notes-column div#notes-options-menu')
            .contains('Sort By')
        cy.get('div#notes-column div#notes-options-menu')
            .contains('Enable Reverse Sort')

        cy.get('div#notes-column div#notes-options-menu')
            .should(($labels) => {
                expect($labels).to.contain('Date Added')
                expect($labels).to.contain('Date Modified')   
                expect($labels).to.contain('Title')   
                expect($labels).to.contain('Display')   
                expect($labels).to.contain('Archived Notes')   
                expect($labels).to.contain('Pinned Notes')   
                expect($labels).to.contain('Note Preview')   
                expect($labels).to.contain('Date')   
                expect($labels).to.contain('Tags')   
            })   

        cy.get('div#notes-column div#notes-menu-bar')
            .contains('Options')
            .click()
    });



    it('Editor Column - Verify all labels for Note options', () => {

        cy.get('div#editor-column div.sk-app-bar-item > div.sk-label')
            .should(($label) => {
                expect($label).to.contain('Options')
                expect($label).to.contain('Editor')
                expect($label).to.contain('Actions')
                expect($label).to.contain('Session History')
            })     

    });

    it('Editor Column - Click on Options label - Verify all labels', () => {

        cy.get('div#editor-column div.sk-app-bar-item > div.sk-label').contains('Options')
            .click()

        cy.get('div#editor-column div.sk-menu-panel-header > div.sk-menu-panel-header-title')
            .should(($title) => {
                expect($title).to.contain('Note Options')
                expect($title).to.contain('Global Display')            
            })

        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label')
            .should(($label) => {
                expect($label).to.contain('Pin')
                expect($label).to.contain('Archive')
                expect($label).to.contain('Lock')
                expect($label).to.contain('Protect')
                expect($label).to.contain('Preview')
                expect($label).to.contain('Move to Trash')
                expect($label).to.contain('Monospace Font')
                expect($label).to.contain('Spellcheck')
                expect($label).to.contain('Margin Resizers')
            })
    });
    
    it('Editor Column - Click on Editor label - Verify all labels', () => {

        cy.get('div#editor-column div.sk-app-bar-item > div.sk-label')
            .contains('Editor')
            .click()

        cy.get('div#editor-column div.sk-menu-panel-header > div.sk-menu-panel-header-title')
            .contains('Note Editor')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label')
            .should(($label) => {
                expect($label).to.contain('Plain Editor')
                expect($label).to.contain('Download More Editors')
            })
    });

    it('Editor Column - Click on Actions label - Verify all labels', () => { 

        cy.get('div#editor-column div.sk-app-bar-item > div.sk-label')
            .contains('Actions')
            .click()

        cy.get('div.sk-menu-panel-column > div.sk-label')
            .contains('Download Actions')
    }); 
    
    it('Editor Column - Click on Session History label and click on Options - Verify all labels', () => {
  
        cy.get('div#editor-column div.sk-app-bar-item > div.sk-label')
            .contains('Session History')
            .click()

        cy.get('div.sk-menu-panel.dropdown-menu a.sk-a')
            .contains('Options')
            .click()

        cy.get('div.sk-menu-panel-header > div.sk-menu-panel-header-title')
            .contains('No revisions')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label')
            .should(($label) => {
                expect($label).to.contain('Clear note local history')
                expect($label).to.contain('Clear all local history')
                expect($label).to.contain('Disable auto cleanup')
                expect($label).to.contain('Enable saving history to disk')           
            })
    });


    it('Add a note - Verify that the Editor Column displays the notes Title, Tag, Content', () => {

        getElementScope('div#tags-column div#tags-content input.title:first')
            .its('tag.title')
            .should('contain','All notes')

        createNote('Note1 Title', 'Tag1', 'Note1 Content')

        // This does not work since the Note1 Title text is not visible in the HTML..
        // The string valuec comes from an Angular ng-model
        // cy.get('div#editor-title-bar input.input')
        //     .contains('Note1 Title')
        getElementScope('div#editor-column div#editor-title-bar input.input')
            .its('ctrl.note.title')
            .should('contain','Note1 Title')    

        getElementScope('div#editor-column div#editor-title-bar input.tags-input')
            .its('ctrl.tagsString')
            .should('contain','Tag1') 

        getElementScope('div#editor-column textarea.editable')
            .its('ctrl.note.text')
            .should('contain','Note1 Content') 
    
    });

    it('Add a note - Verify that the Notes Column displays the note', () => {

        createNote('Note1 Title', 'Tag1', 'Note1 Content')

        cy.get('div#notes-column div.note-preview')
            .contains('Note1 Content')
        cy.get('div#notes-column div.note')
            .contains('Note1 Title')
        cy.get('div#notes-column div.tags-string')
            .contains('Tag1')
    
    });

    it('Add a note - In the Editor Column click Options - Pin and verify that the Note in the Notes Column shows the Pin status', () => {

        createNote('Note1 Title', 'Tag1', 'Note1 Content')

        cy.get('div#editor-column div.sk-app-bar-item > div.sk-label')
            .contains('Options')
            .click()

        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label')
            .contains('Pin')
            .click()

        cy.get('div#editor-column div.sk-app-bar-item > div.sk-label').contains('Options')
            .click()
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label')
            .contains('Unpin')

        cy.get('div#notes-column div.note')
            .should(($note) => {
                expect($note).to.contain('Note1 Title')
                expect($note).to.contain('Pinned')
            })
    
    });


    it('Add a note - In the Editor Column click Options - Archive, click on the Archived link in the Tags Column and verify that the Notes Column displays the Archived Note', () => {

        createNote('Note1 Title', 'Tag1', 'Note1 Content')

        cy.get('div#editor-column div.sk-app-bar-item > div.sk-label').contains('Options')
        .click()

        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label')
            .contains('Archive')
            .click()

        cy.get('div#tags-column div#tags-content input.title')
            .eq(1)
            .click({force: true})

        cy.get('div#notes-column div.note')
        .should(($note) => {
            expect($note).to.contain('Note1 Title')
            expect($note).to.contain('Archived')
        })
    });

    it('Add 3 notes and use the Search text box to search for notes', () => {

        createNote('The sky is blue', 'tag1', 'Note1 Content')
        createNote('Sky turned dark today', 'tag1', 'Note2 Content')
        createNote('Travelling to the moon', 'tag3', 'Note3 Content')

        cy.get('input.filter-bar')
            .should('have.attr','placeholder','Search')
            .click()
            .clear()
            .type('sky')

        cy.get('div#notes-column div#notes-scrollable > div.note')
            .should(($note) => {
                expect($note).to.have.length(2)
                expect($note).to.contain('The sky is blue')
                expect($note).to.contain('Sky turned dark today')
            })
    });

});


function login() {
    cy.window()
        .then((window) => {
            window.localStorage.setItem("jwt", "XeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3V1aWQiOiI3ZjFhNDVhZC0xNTAyLTQxNTItYjQyZi05NWUzOTFkNDUyMDUiLCJwd19oYXNoIjoiZjA1MWUzZThhNjA3OGMwOTY0YjE3NzM3MTU2OWM3YmQwZmFlY2QzNjI2NjMzNmZkNjQyMDU3ZGJkYmIwNzkyYiJ9.ZFgb6j2xpHmKSYJ0hC_Fh5QVY8SqWbxDN9nFkWuUnWs")
            window.localStorage.setItem("auth_params", "{\"pw_nonce\":\"001a262123450192d62457dedfc26d9cf76c5919ee72c4991b85d5e5514d6113\",\"pw_cost\":110000,\"identifier\":\"aaa@aaa.com\",\"version\":\"003\"}")
            window.localStorage.setItem("syncToken", "XMjoxNTY0NjMwNTk3LjM5MDgyMzY=")
            window.localStorage.setItem("ak", "X1b856eb5837f126afa1fdb277642cc3aadf622f1f74d63c3b73c287aaeac2fff")
            window.localStorage.setItem("server", "https://sync.standardnotes.org")
            window.localStorage.setItem("user", "{\"uuid\":\"7f1a45ad-1502-4152-b42f-95e391d45205\",\"email\":\"aaa@aaa.com\"}")
            window.localStorage.setItem("ephemeral", false)
            window.localStorage.setItem("mk", "X128e163b6d57cec50183d45f56223865afa18afe513fc3463bab214497fb6cd8")
        })
}

function createNote(title, tag, content) {

    cy.get('div#notes-column div.sk-button.contrast')
        .should('have.attr','title','Create a new note in the selected tag')
        .click()

    cy.get('div[id=editor-title-bar] input.input')
        .should('have.attr','id','note-title-editor') 
        .click()
        .clear()   
        .type(title)

    cy.get('div.editor-tags input.tags-input')
        .should('have.attr','placeholder','#tags')
        .click()
        .clear()
        .type(tag)

    cy.get('div#editor-column textarea.editable')
        .should('have.attr','id','note-text-editor')
        .click()
        .clear()
        .type(content)
}



const getAngular = () =>
  cy.window()
    .its('angular')

// get a value from an Angular ng-model
const getElementScope = (selector) =>
  cy.get(selector)
    .then($el =>
      getAngular()
        .then(ng => ng.element($el).scope())
    )




