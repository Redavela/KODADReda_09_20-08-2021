import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import localStorageMock from '../__mocks__/localStorage'
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import firebase from "../__mocks__/firebase.js"
import Firestore from "../app/Firestore";
import Router from "../app/Router";




const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}
Object.defineProperty(window, 'localeStorage', {value:localStorageMock})
window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Firestore.bills = () => ({
        get: jest.fn().mockResolvedValue()
      });
      Object.defineProperty(window, "location", {value: {hash: ROUTES_PATH["Bills"]}});
      document.body.innerHTML = '<div id="root"></div>';
      Router();
      const iconWindows = screen.getByTestId("icon-window");
      expect(iconWindows.classList.contains("active-icon")).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then the loadingPage should be opened if the loading is true", () => {
      const html = BillsUI({ data: bills, loading: true})
      document.body.innerHTML = html;
      const loaderPage = screen.getByText('Loading...')
      expect(loaderPage).toBeTruthy()
    })
    test("Then the errorPage should be opened if an error exist", () => {
      const html = BillsUI({ data: bills, loading: false, error:'page inaccessible'})
      document.body.innerHTML = html;
      const errorPage = screen.getAllByText('page inaccessible')
      expect(errorPage).toBeTruthy()
    })
  })
})


describe('Given i open a bill page',()=>{
  describe('when i click on the button to create a new bill',()=>{
    test('NexBill page should be open', () => {
      const html = BillsUI({ data: bills})
      document.body.innerHTML = html;
      const firestore = null;
      const billContainer = new Bills({ document, onNavigate, firestore, localStorage: window.localStorage })
      const handleClickButton = jest.fn(billContainer.handleClickNewBill)
      const buttonNewBill =screen.getByTestId('btn-new-bill')
      buttonNewBill.addEventListener('click',handleClickButton)
      userEvent.click(buttonNewBill)
      
      expect(handleClickButton).toHaveBeenCalled()
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })
  })
  describe('Given when i click on iconEye',()=>{
    test('A modal should be open', () => {
      const html = BillsUI({ data: bills})
      document.body.innerHTML = html;
      const firestore = null
      const billContainer = new Bills({ document, onNavigate, firestore, localStorage: window.localStorage })
      const iconEye =screen.getAllByTestId('icon-eye')[0]
    
      $.fn.modal = jest.fn();
      const handleClickIcon = jest.fn(() => billContainer.handleClickIconEye(iconEye))
      iconEye.addEventListener('click', handleClickIcon)
      userEvent.click(iconEye)
      expect(handleClickIcon).toHaveBeenCalled()
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected ", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})