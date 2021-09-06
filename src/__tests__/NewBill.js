import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { fireEvent } from "@testing-library/dom"
import firebase from "../__mocks__/firebase.js"
import Firestore from "../app/Firestore.js"


const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}
Object.defineProperty(window, 'localeStorage', {value:localStorageMock})
window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then a new bill should be opened if i submit on ", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillContainer = new NewBill({ document, onNavigate, firestore: null, localStorage: window.localStorage })
      
      const handleSubmit = jest.fn((e) => newBillContainer.handleSubmit(e))
      const buttonNewBill = screen.getByTestId("form-new-bill")
      screen.getByTestId('expense-type').value = 'Transports'
      screen.getByTestId("expense-name").value = 'test1'
      screen.getByTestId('datepicker').value = '2020-05-20'
      screen.getByTestId('amount').value =150 
      screen.getByTestId('vat').value = 70
      screen.getByTestId('pct').value = 50
      screen.getByTestId('commentary').value = 'blabla'
      newBillContainer.fileName = 'test.png'
      newBillContainer.fileUrl = 'https://dummyimage.com/600x400/000/fff'
      buttonNewBill.addEventListener('click',handleSubmit)
      fireEvent.click(buttonNewBill)
      const btnNewBill = screen.getByTestId('btn-new-bill')
  
      expect(handleSubmit).toHaveBeenCalled()
      expect(btnNewBill).toBeTruthy()
    })
    test("Then upload an image with a correct file name", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const fire = {
        storage: jest.fn()
      }
      fire.storage.ref = jest.fn(() => {
          return {put: jest.fn().mockResolvedValue()}
      });
      const newBillContainer = new NewBill({ document, onNavigate, firestore: fire, localStorage: window.localStorage })
      const handleChangeFile = jest.fn((e) => newBillContainer.handleChangeFile(e))
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, {
        target : {
            files : [
              new File([], 'reda.jpeg', {  type: 'image/jpeg'})
            ]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile).toBeTruthy()
    })
    test("Then upload an image with an uncorrect file name", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillContainer = new NewBill({ document, onNavigate, firestore: null, localStorage: window.localStorage })
      const handleChangeFile = jest.fn(() => newBillContainer.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File(['(⌐□_□)'], 'reda.exe', {type: 'image/exe'})],
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.value).toBe('')
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as employee", () => {
  describe("When I post a new Bill", () => {
    test("create a bill from mock API POST", async () => {
       const getSpy = jest.spyOn(firebase, "post")
       const newBill = {
        "id": "qcCK3SzECmaZAGRrHjaC",
        "status": "refused",
        "pct": 20,
        "amount": 200,
        "email": "a@a",
        "name": "test2",
        "vat": "40",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2002-02-02",
        "commentAdmin": "pas la bonne facture",
        "commentary": "test2",
        "type": "Restaurants et bars",
        "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
      }
      const bills = await firebase.post(newBill)
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(1)
    })
  })
})
