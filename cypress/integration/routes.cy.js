import { ThematicLayer } from '../elements/thematic_layer.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

context('Routes', () => {
    it('loads root route', () => {
        cy.visit('/', { timeout: 50000 })
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')
        cy.title().should('equal', 'Maps | DHIS2')
    })

    it('loads with map id (legacy)', () => {
        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )
        cy.visit('/?id=ytkZY3ChM6J', EXTENDED_TIMEOUT) //ANC: 3rd visit coverage last year by district

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        const Layer = new ThematicLayer()
        Layer.validateCardTitle('ANC 3 Coverage')
    })

    it('loads with map id (hash)', () => {
        cy.visit('/#/zDP78aJU8nX', EXTENDED_TIMEOUT) //ANC: 1st visit coverage (%) by district last year

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        const Layer = new ThematicLayer()
        Layer.validateCardTitle('ANC 1 Coverage')
    })

    it('loads currentAnalyticalObject (legacy)', () => {
        cy.intercept('**/userDataStore/analytics/settings', {
            fixture: 'analyticalObject.json',
        })

        cy.visit('/?currentAnalyticalObject=true', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.contains('button', 'Proceed').click()

        const Layer = new ThematicLayer()
        Layer.validateCardTitle('ANC 1 Coverage')
        cy.get('canvas.maplibregl-canvas').should('be.visible')
    })

    it('loads currentAnalyticalObject (hash)', () => {
        cy.intercept('**/userDataStore/analytics/settings', {
            fixture: 'analyticalObject.json',
        })

        cy.visit('/#/currentAnalyticalObject', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.contains('button', 'Proceed').click()

        const Layer = new ThematicLayer()
        Layer.validateCardTitle('ANC 1 Coverage')
        cy.get('canvas.maplibregl-canvas').should('be.visible')
    })

    it('loads with map id (legacy) and interpretationid lowercase', () => {
        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )
        cy.visit(
            '/?id=ZBjCfSaLSqD&interpretationid=yKqhXZdeJ6a',
            EXTENDED_TIMEOUT
        ) //ANC: LLITN coverage district and facility

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201)

        cy.getByDataTest('interpretation-modal')
            .find('h1')
            .contains(
                'Viewing interpretation: ANC: LLITN coverage district and facility'
            )
            .should('be.visible')
    })

    it('loads with map id (legacy) and interpretationId uppercase', () => {
        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )
        cy.visit(
            '/?id=ZBjCfSaLSqD&interpretationId=yKqhXZdeJ6a',
            EXTENDED_TIMEOUT
        ) //ANC: LLITN coverage district and facility

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201)

        cy.getByDataTest('interpretation-modal')
            .find('h1')
            .contains(
                'Viewing interpretation: ANC: LLITN coverage district and facility'
            )
            .should('be.visible')
    })

    it('loads with map id (hash) and interpretationId', () => {
        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )
        cy.visit(
            '/#/ZBjCfSaLSqD?interpretationId=yKqhXZdeJ6a',
            EXTENDED_TIMEOUT
        ) //ANC: LLITN coverage district and facility

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201)

        cy.getByDataTest('interpretation-modal')
            .find('h1')
            .contains(
                'Viewing interpretation: ANC: LLITN coverage district and facility'
            )
            .should('be.visible')
    })

    it('loads download page for map id (hash)', () => {
        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )
        cy.visit('/#/ZBjCfSaLSqD/download', EXTENDED_TIMEOUT) //ANC: LLITN coverage district and facility

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201)

        cy.getByDataTest('download-settings').should('be.visible')
        cy.get('canvas.maplibregl-canvas').should('be.visible')
        cy.get('button').contains('Exit download mode').should('be.visible')
    })

    it('loads download page currentAnalyticalObject (hash)', () => {
        cy.intercept('**/userDataStore/analytics/settings', {
            fixture: 'analyticalObject.json',
        })

        cy.visit('/#/currentAnalyticalObject/download', EXTENDED_TIMEOUT)

        cy.contains('button', 'Proceed').click()

        cy.getByDataTest('download-settings').should('be.visible')
        cy.get('canvas.maplibregl-canvas').should('be.visible')
        cy.get('button').contains('Exit download mode').should('be.visible')
    })

    it('loads download page for new map', () => {
        cy.visit('/', EXTENDED_TIMEOUT)

        cy.get('canvas.maplibregl-canvas').should('be.visible')
        cy.get('button').contains('Download').click()

        cy.getByDataTest('download-settings').should('be.visible')
        cy.get('canvas.maplibregl-canvas').should('be.visible')
        cy.get('button').contains('Exit download mode').should('be.visible')
        cy.url().should('include', '#/download')

        cy.get('button').contains('Exit download mode').click()

        cy.url().should('not.include', 'download')

        cy.get('button').contains('Add layer').should('be.visible')
    })
})
