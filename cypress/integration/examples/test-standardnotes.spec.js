// <reference types="Cypress" />

// Test plan for standardnotes app

   // Check for links to 'All Notes', 'Archived', 'Trash', 'Tags' under the 'views' section. Each time you click on one of the links, the link name should show on 
   // top of the page.Check for + button for adding tags.
describe('Test cases for Standardnotes app', () => {
    it('check for links to Allnotes, Archived, Trash, Tags, + button and the title of the section, \'views\'', () => {
        cy.visit('http://localhost:3000')
        cy.get('div.title > span.sk-bold').contains('Views')
        cy.get('div.title > span.sk-bold').contains('Tags')
        cy.get('div.sk-button.sk-secondary-contrast').should('have.attr','title','Create a new tag')
        .click()
        
    });

    //check for 'Search' , all options for search under the 'options' drop down window. Options are Date added, Date modified, Title, Display, Archived notes, 
    // Pinned notes, Note preview, Date, Tags. Check for sorting with the dates (Enable reverse sort).
    // Check for '+' button for adding 'Notes'.
    it('check for Search, Options, sort By, Date Added, Date Modified, Title, Display, Archived Notes,Pinned Notes,NOte Preview, DAte,Tags', () => {
        cy.visit('http://localhost:3000')
        cy.get('input.filter-bar').should('have.attr','placeholder','Search')
        cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-label').contains('Options')
        .click()
        cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-sublabel').contains('Date Added')
        cy.get('div#notes-column div.sk-menu-panel  div.sk-menu-panel-header-title').contains('Sort By')
        cy.get('div#notes-column div.sk-menu-panel  a.info').contains('Enable Reverse Sort')


        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label')
        .should(($labels) => {
            expect($labels).to.contain('Date Added')
            expect($labels).to.contain('Date Modified')           
        })

        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Date Added')
        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Date Modified')
        
        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Title')
        cy.get('div#notes-column div.sk-menu-panel-header > div.sk-menu-panel-header-title').contains('Display')
        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Archived Notes')
        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Pinned Notes')
        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Note Preview')
        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Date')
        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Tags')
        cy.get('div#notes-column div.sk-button.contrast').should('have.attr','title','Create a new note in the selected tag')
        .click()


        // The 'Title' of the  page should come up for each article. Should be able to add 'tags' for each article.
        // Check for the 'options' drop down window. Options are Note OPtions, Pin, Title, Archive, Lock, Protect, Preview, 
        // Move to Trash, Global Display, Monospace Font, Spellcheck, Margin Resizers.  The 'Editor' drop down window should have 'Plain Editor',and 'Download 
        // more Editors'. The 'Actions' drop down window has 'Download Actions'. The 'Session History' dropdown should show the revisions, and cleanup options.

        cy.get('div[id=editor-title-bar] input.input').should('have.attr','id','note-title-editor')
        cy.get('div.editor-tags input.tags-input').should('have.attr','placeholder','#tags')
        cy.get('div.sk-app-bar-item > div.sk-label').contains('Options')
        .click()
        cy.get('div#editor-column div.sk-menu-panel-header > div.sk-menu-panel-header-title').contains('Note Options')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Pin')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Archive')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Lock')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Protect')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Preview')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Move to Trash')
        cy.get('div#editor-column div.sk-menu-panel-header > div.sk-menu-panel-header-title').contains('Global Display')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Monospace Font')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Spellcheck')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Margin Resizers')


        cy.get('div.sk-app-bar-item > div.sk-label').contains('Editor')
        .click()
        cy.get('div#editor-column div.sk-menu-panel-header > div.sk-menu-panel-header-title').contains('Note Editor')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Plain Editor')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Download More Editors')


        cy.get('div.sk-app-bar-item > div.sk-label').contains('Actions')
        .click()
        cy.get('div.sk-menu-panel-column > div.sk-label').contains('Download Actions')


        cy.get('div.sk-app-bar-item > div.sk-label').contains('Session History')
        .click()

        cy.get('div.sk-menu-panel.dropdown-menu a.sk-a')
        .contains('Options')
        .click()

        //cy.get('div.sk-menu-panel-header > div.sk-menu-panel-header-title').contains('No Revisions')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Clear note local history')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Clear all local history')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Disable auto cleanup')
        cy.get('div#editor-column div.sk-menu-panel-column > div.sk-label').contains('Enable saving history to disk')

    });
       // Adding Articles with title, tag, content. Checking to see if it is being recorded in the notes column.
    it.only('click on add notes button', () => {
        cy.visit('http://localhost:3000')
        indexedDB.deleteDatabase('standardnotes')
        cy.get('div#notes-column div.sk-button.contrast').should('have.attr','title','Create a new note in the selected tag')
        .click()
        cy.get('div[id=editor-title-bar] input.input').should('have.attr','id','note-title-editor') 
        .click()
        .clear()   
        .type('note1-title')
        cy.get('div.editor-tags input.tags-input').should('have.attr','placeholder','#tags')
        .click()
        .clear()
        .type('tag1')
        cy.get('div#editor-column textarea.editable').should('have.attr','id','note-text-editor')
        .click()
        .clear()
        .type('note1-content')

        cy.get('div#notes-column div.sk-button.contrast').should('have.attr','title','Create a new note in the selected tag')
        .click()
        cy.get('div[id=editor-title-bar] input.input').should('have.attr','id','note-title-editor') 
        .click()
        .clear()   
        .type('note2-title')
        cy.get('div.editor-tags input.tags-input').should('have.attr','placeholder','#tags')
        .click()
        .clear()
        .type('tag1')
        cy.get('div#editor-column textarea.editable').should('have.attr','id','note-text-editor')
        .click()
        .clear()
        .type('note2-content')

        cy.get('div#notes-column div.note-preview').contains('content')
        cy.get('div#notes-column div.note').contains('title')
        cy.get('div#notes-column div.tags-string').contains('tag1')

        // Checking to see that all the options show up on the sub title bar in the notes column.
        cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-label').contains('Options')
        .click()

        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Date Added')
        .click()
        cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-sublabel').contains('Date Added') 
        
        cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-label').contains('Options')
        .click()
        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Date Modified')
        .click()
        cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-sublabel').contains('Date Modified')

        cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-label').contains('Options')
        .click()
        cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Title')
        .click()
        cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-sublabel').contains('Title')
        
        //cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-label').contains('Options')
        //.click()
        //cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Archived Notes')
        //.click()
        //cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-sublabel').contains('Archived')

        //cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-label').contains('Options')
        //.click()
        //cy.get('div#notes-column div.sk-menu-panel-column > div.sk-label').contains('Pinned Notes')
        //.click()
        //cy.get('div#notes-column div.sk-app-bar-item-column > div.sk-sublabel').contains('Pinned')
        
        // Searching for Article using title, content, tag.
        cy.get('input.filter-bar').should('have.attr','placeholder','Search')
        .click()
        .clear()
        .type('title')
        cy.get('div#notes-column div#notes-scrollable > div.note').should('have.length', 2)






    });

});





// The 'Title' of the  page should come up for each article. Should be able to add 'tags' for each article.
// Check for the 'options' drop down window. Options are Note OPtions, Pin, Title, Archive, Lock, Protect, Preview, 
// Move to Trash, Global Display, Monospace Font, Spellcheck, Margin Resizers.  The 'Editor' drop down window should have 'Plain Editor',and 'Download 
// more Editors'. The 'Actions' drop down window has 'Download Actions'. The 'Session History' dropdown should show the revisions, and cleanup options.

// Once you write an article with title and tags, it should show up in the 'All notes' link.  Add more articles. You should be able to search  for the article 
// with either the title or tag or the content . The articles can be sorted by the dates. The article can be modified, deleted, archived, pinned and locked. 
// each of these actions show with the article title.
//