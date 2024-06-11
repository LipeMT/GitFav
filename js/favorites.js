export class GithubUser {
    static search(username) {
        const endpoint = `https://api.github.com/users/${username}`

        return fetch(endpoint)
            .then(data => data.json())
            .then(({ login, name, public_repos, followers }) =>
            (
                {
                    login,
                    name,
                    public_repos,
                    followers
                }
            ))
        /*DESESTRUTURAÇÃO, representa a mesma coisa do código comentado abaixo. Nos parâmetros da função ele pega os elementos login, name, public_repos e followers, que estão dentro de "data", que é o conteúdo, e coloca dentro de um objeto com as chaves ou propriedades: login, name, public_repos e followers, que é o retorno da arrow function acima. Por isso, o retorno sera o seguinte objeto: 
        ({
            login: login, //(data.login)
            name: name, //(data.name)
            public_repos: public_repos, //(data.public_repos)
            followers: followers, //(data.followers)
        })
        */

        // .then(data => ({
        //     login: data.login,
        //     name: data.name,
        //     public_repos: data.public_repos,
        //     followers: data.followers,
        // }))
    }
}

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load()

        // GithubUser.search('LipeMT').then(user => console.log(user))
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries)) //JSON.stringfy faz a conversão de um objeto ou array para uma string JSON, isso faz com que o localstorage consiga fazer a leitura e armazenamento dos dados.
    }

    async add(username) {
        try {
            // Verifica se já existe um usuário com o login no qual quero cadastrar
            const userExists = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase())

            if (userExists) {
                throw new Error('Usuário já cadastrado!');
            }

            const user = await GithubUser.search(username)

            if (user.login === undefined) {
                throw new Error('Usuário não encontrado')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()

        } catch (error) {
            alert(error.message)
        }
    }


    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login) //essa função percorre o array retorna aquela linha (ou objeto) filtrada se o parâmetro passado for verdadeiro, caso ele seja falso, ele pula a linha 
        this.entries = filteredEntries;
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()

        this.onAdd()
    };

    onAdd() {
        const btnAdd = this.root.querySelector('#addUser')
        btnAdd.onclick = () => {
            let { value } = this.root.querySelector('#input-search')

            this.add(value)
        }
    }

    update() {

        this.removeAllTr()

        this.entries.forEach(user => {
            const row = this.createRow();

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers
            row.querySelector('.remove').onclick = () => {
                if (confirm('Tem certeza que deseja deletar essa linha?')) {
                    return this.delete(user);
                }
            }

            this.tbody.append(row) //adiciona os dados no elemento tbody da tabela
        })
    }

    createRow() {

        const tr = document.createElement('tr')

        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/LipeMT.png" alt="Imagem Lipe">
                <a href="https://github.com/LipeMT" target="_blank">
                    <p>Lipe Tomé</p>
                    <span>lipeMT</span>
                </a>
            </td>
            <td class="repositories">30</td>
            <td class="followers">50</td>
            <td><button class="remove">&times;</button></td>
        `
        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach(tr => {
            tr.remove()
        });

    }
}
