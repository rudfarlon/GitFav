import { GithubUser } from "./GithubUser.js"

// classe que vai conter a lógica dos dados
// como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {    
    try {
      
      const userExists = this.entries.find(entry => entry.login === username)
  
      if(userExists) {
        throw new Error('Usúario já cadastrado')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usúario não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }

  }

  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
    this.createBg()
  }
}

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
    this.createBg()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
      this.clean()
    }

    document.addEventListener('keypress', function(btn) {
      if(btn.key === "Enter") {
        btn = addButton.onclick()
      }
    })

  }

  clean() {
    document.querySelector('#input-search').value = "";
  }

  update() {
    this.removeAllTr()

    this.entries.forEach( user => {
      const row = this.createRow() 

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if(isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createBg() {
    const userElement = document.querySelector('tbody > tr')
    const tbody = document.querySelector('tbody')

    if(userElement === null) {
      const tr = document.createElement('tr')
      tr.innerHTML = `
      <td colspan="4" style="border: 0px solid transparent; height: 50vh; ">
        <div class="empty">
          <img src="./image/Estrela.svg" /> Nenhum favorito ainda
        </div>
      </td>
      `
      tbody.append(tr)
    }
  }

  createRow() {
    const tr = document.createElement('tr')


    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/maykbrito.png" alt="Imagem do usuário">
        <a href="https://github.com/maykbrito" target="_blank">
          <p>Mayk Brito</p>
          <span>maykbrito</span>
        </a>
      </td>
      <td class="repositories">
        76
      </td>
      <td class="followers">
        1234
      </td>
      <td>
        <button class="remove">Remove</button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }
}