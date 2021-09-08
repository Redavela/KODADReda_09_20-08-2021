import { ROUTES_PATH } from '../constants/routes.js'

export default class Logout {
  constructor({ document, onNavigate, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.localStorage = localStorage
    if($ === undefined){
      const layoutDisconnect = this.document.getElementById('layout-disconnect')
      layoutDisconnect.addEventListener('click',this.handleClick)
    }else{
      $('#layout-disconnect').on('click',this.handleClick)
    }
    
    
  }
  
  handleClick = (e) => {
    this.localStorage.clear()
    this.onNavigate(ROUTES_PATH['Login'])
  }
} 