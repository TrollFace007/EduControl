// ======================================
// EDUCONTROL - SISTEMA DE ALUNOS
// ======================================

const CHAVE = "educontrol_alunos";

// Lê os alunos salvos no navegador
function obterAlunos() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE)) || [];
    } catch {
        return [];
    }
}

// Salva os alunos no navegador
function salvarAlunos(alunos) {
    localStorage.setItem(CHAVE, JSON.stringify(alunos));
}

// Gera um código para cada aluno
function gerarId() {
    return Date.now().toString() + Math.random().toString(16).slice(2);
}

// ======================================
// LOGIN
// ======================================

const formularioLogin = document.getElementById("loginForm");

if (formularioLogin) {
    formularioLogin.addEventListener("submit", function(evento) {
        evento.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const senha = document.getElementById("senha").value;

        if (usuario !== "" && senha !== "") {
            sessionStorage.setItem("educontrol_login", "sim");
            window.location.href = "dashboard.html";
        }
    });
}

// Sair do sistema
function sair() {
    sessionStorage.removeItem("educontrol_login");
    window.location.href = "index.html";
}

// ======================================
// CADASTRO E ALTERAÇÃO
// ======================================

const formularioAluno = document.getElementById("alunoForm");

if (formularioAluno) {
    const parametros = new URLSearchParams(window.location.search);
    const idEditar = parametros.get("editar");

    // Se existir um código na URL, carrega o aluno para edição
    if (idEditar) {
        const aluno = obterAlunos().find(a => a.id === idEditar);

        if (aluno) {
            document.getElementById("alunoId").value = aluno.id;
            document.getElementById("nome").value = aluno.nome;
            document.getElementById("idade").value = aluno.idade;
            document.getElementById("sexo").value = aluno.sexo || "";
            document.getElementById("telefone").value = aluno.telefone || "";
            document.getElementById("email").value = aluno.email;

            document.getElementById("tituloFormulario").textContent =
                "Alterar cadastro";

            document.getElementById("botaoSalvar").textContent =
                "Salvar alterações";
        }
    }

    formularioAluno.addEventListener("submit", function(evento) {
        evento.preventDefault();

        const alunos = obterAlunos();
        const id = document.getElementById("alunoId").value;

        const nome = document.getElementById("nome").value.trim();
        const idade = Number(document.getElementById("idade").value);
        const sexo = document.getElementById("sexo").value;
        const telefone = document.getElementById("telefone").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();

        const mensagem = document.getElementById("mensagem");

        if (!nome || !email || !Number.isInteger(idade) ||
            idade < 1 || idade > 120) {
            mensagem.textContent = "Confira os dados preenchidos.";
            return;
        }

        // Impede dois alunos com o mesmo e-mail
        const emailExiste = alunos.some(aluno =>
            aluno.email.toLowerCase() === email && aluno.id !== id
        );

        if (emailExiste) {
            mensagem.textContent = "Este e-mail já está cadastrado.";
            return;
        }

        const aluno = {
            id: id || gerarId(),
            nome: nome,
            idade: idade,
            sexo: sexo,
            telefone: telefone,
            email: email
        };

        if (id) {
            const indice = alunos.findIndex(a => a.id === id);

            if (indice !== -1) {
                alunos[indice] = aluno;
            }

            mensagem.textContent = "Aluno alterado com sucesso!";
        } else {
            alunos.push(aluno);
            mensagem.textContent = "Aluno cadastrado com sucesso!";
        }

        salvarAlunos(alunos);
        formularioAluno.reset();

        document.getElementById("alunoId").value = "";
        document.getElementById("tituloFormulario").textContent =
            "Cadastro de alunos";
        document.getElementById("botaoSalvar").textContent =
            "Salvar aluno";

        // Atualiza o total se o painel estiver aberto
        atualizarTotal();
    });
}

// ======================================
// LISTAGEM E CONSULTA
// ======================================

function mostrarAlunos() {
    const tabela = document.getElementById("tabelaAlunos");

    if (!tabela) return;

    const pesquisa = document.getElementById("pesquisa")
        .value.trim().toLowerCase();

    const alunos = obterAlunos();

    const filtrados = alunos.filter(aluno =>
        aluno.nome.toLowerCase().includes(pesquisa) ||
        aluno.email.toLowerCase().includes(pesquisa)
    );

    tabela.innerHTML = "";

    filtrados.forEach(aluno => {
        const linha = document.createElement("tr");

        const dados = [
            aluno.id.slice(-6),
            aluno.nome,
            aluno.idade,
            aluno.sexo || "Não informado",
            aluno.telefone || "Não informado",
            aluno.email
        ];

        dados.forEach(valor => {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaAcoes = document.createElement("td");

        const botaoEditar = document.createElement("button");
        botaoEditar.textContent = "Editar";
        botaoEditar.className = "editar";

        botaoEditar.addEventListener("click", function() {
            window.location.href =
                "cadastro.html?editar=" + encodeURIComponent(aluno.id);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.className = "excluir";

        botaoExcluir.addEventListener("click", function() {
            const confirmar = confirm(
                "Deseja realmente excluir " + aluno.nome + "?"
            );

            if (confirmar) {
                const atualizados = obterAlunos().filter(
                    item => item.id !== aluno.id
                );

                salvarAlunos(atualizados);
                mostrarAlunos();
                atualizarTotal();
            }
        });

        celulaAcoes.appendChild(botaoEditar);
        celulaAcoes.appendChild(botaoExcluir);
        linha.appendChild(celulaAcoes);
        tabela.appendChild(linha);
    });

    document.getElementById("semAlunos").textContent =
        filtrados.length === 0
            ? "Nenhum aluno encontrado."
            : "";

    document.getElementById("quantidade").textContent =
        "Total de alunos encontrados: " + filtrados.length;
}

// Pesquisa em tempo real
const campoPesquisa = document.getElementById("pesquisa");

if (campoPesquisa) {
    campoPesquisa.addEventListener("input", mostrarAlunos);
    mostrarAlunos();
}

// ======================================
// TOTAL NO PAINEL INICIAL
// ======================================

function atualizarTotal() {
    const elemento = document.getElementById("totalAlunos");

    if (elemento) {
        elemento.textContent = obterAlunos().length;
    }
}

atualizarTotal();

// ======================================
// FORMULÁRIO DE CONTATO
// ======================================

const formularioContato = document.getElementById("contatoForm");

if (formularioContato) {
    formularioContato.addEventListener("submit", function(evento) {
        evento.preventDefault();

        document.getElementById("respostaContato").textContent =
            "Mensagem registrada nesta demonstração. Obrigado!";

        formularioContato.reset();
    });
}