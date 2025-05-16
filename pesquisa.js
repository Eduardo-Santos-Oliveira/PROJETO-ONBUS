document.addEventListener('DOMContentLoaded', function () {
    const btnPesquisar = document.getElementById('btnPesquisar');
    const pesquisaInput = document.getElementById('pesquisaLinha');
    const resultadoContainer = document.getElementById('resultadoPesquisa');
    const btnAvaliar = document.getElementById('btnAvaliarSeguranca');
    const modalSeguranca = document.getElementById('modalSeguranca');
    const feedback = document.getElementById('feedbackAvaliacao');
    const closeModal = document.querySelector('.close-modal-seguranca');
    const comentarioInput = document.getElementById('comentarioSeguranca');
    const enviarBtn = document.getElementById('enviarAvaliacao');
    const removerBtn = document.getElementById('removerAvaliacao');
    const opcoesAvaliacao = document.querySelectorAll('.opcao-container');
    const localizacaoAtualEl = document.getElementById('localizacaoAtual');
    const avaliacaoAnonima = document.getElementById('avaliacaoAnonima');
    const feedbackContainer = document.getElementById('feedback-container');
    const detalhesLinhaModal = document.getElementById('detalhesLinhaModal');
    const closeDetalhesModal = document.querySelector('.close-modal');
    const filtroLocal = document.getElementById('filtroLocal');
    const btnVerRota = document.getElementById('btnVerRota');
    let avaliacaoSelecionada = null;
    let paradaAtual = null;
    let localizacaoAtual = null;
    let linhaSelecionada = null;
    btnPesquisar.addEventListener('click', pesquisarLinhas);
    pesquisaInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            pesquisarLinhas();
        }
    });
    closeDetalhesModal.addEventListener('click', () => {
        detalhesLinhaModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    window.addEventListener('click', (e) => {
        if (e.target === detalhesLinhaModal) {
            detalhesLinhaModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    btnAvaliar.addEventListener('click', iniciarAvaliacao);
    closeModal.addEventListener('click', fecharModal);
    window.addEventListener('click', e => e.target === modalSeguranca && fecharModal());
    enviarBtn.addEventListener('click', enviarAvaliacao);
    removerBtn.addEventListener('click', removerAvaliacao);
    comentarioInput.addEventListener('input', validarFormulario);
    opcoesAvaliacao.forEach(opcao => {
        opcao.addEventListener('click', () => {
            opcoesAvaliacao.forEach(o => o.classList.remove('selected'));
            opcao.classList.add('selected');
            avaliacaoSelecionada = opcao.dataset.avaliacao;
            validarFormulario();
            mostrarFeedback(`Selecionado: ${opcao.querySelector('.opcao-label').textContent}`, 'info');
        });
    });
    function getTransportIcon(linha) {
        if (!linha.numero) return 'fa-bus';
        if (/^\d{3}$/.test(linha.numero)) return 'fa-bus'; 
        if (/^M-/.test(linha.numero)) return 'fa-subway'; 
        if (/^T-/.test(linha.numero)) return 'fa-train'; 
        if (/^\d{2}[A-Z]$/.test(linha.numero)) return 'fa-van-shuttle'; 
        return 'fa-bus';
    }
    function formatarHorarios(horarios) {
        if (!horarios) return '';
        if (Array.isArray(horarios)) {
            return horarios.map(horario => {
                return `<span class="horario-tag"><i class="far fa-clock"></i> ${horario}</span>`;
            }).join('');
        } else {
            return `<span class="horario-tag"><i class="far fa-clock"></i> ${horarios}</span>`;
        }
    }
    async function pesquisarLinhas() {
        const termo = pesquisaInput.value.trim();
        if (!termo) {
            resultadoContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Digite um termo para pesquisar</p>
                </div>
            `;
            return;
        }
        resultadoContainer.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Buscando linhas...</p>
            </div>
        `;
        try {
            const response = await fetch(`/api/linhas/pesquisa?termo=${encodeURIComponent(termo)}`);
            const { data } = await response.json();
            if (!data || data.length === 0) {
                resultadoContainer.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-info-circle"></i>
                        <p>Nenhuma linha encontrada para "${termo}"</p>
                    </div>
                `;
            } else {
                exibirResultados(data);
            }
        } catch (error) {
            console.error('Erro na pesquisa:', error);
            resultadoContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Erro ao buscar linhas. Tente novamente.</p>
                </div>
            `;
        }
    }
function exibirResultados(linhas) {
    resultadoContainer.innerHTML = '';
    if (!linhas || linhas.length === 0) {
        resultadoContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-info-circle"></i>
                <p>Nenhuma linha encontrada</p>
            </div>
        `;
        return;
    }
    linhas.forEach(linha => {
        const card = document.createElement('div');
        card.className = 'linha-card';
        const numeroLinha = linha.numero || linha.nome || 'Linha sem identificação';
        const icon = getTransportIcon(linha);
        const rotaCircular = linha.rotas && linha.rotas.length > 1 && linha.rotas[0] === linha.rotas[linha.rotas.length - 1];
        if (rotaCircular) {
            const meio = Math.floor(linha.rotas.length / 2);
            const rotaIda = linha.rotas.slice(0, meio);
            const rotaVolta = linha.rotas.slice(meio);
            card.innerHTML = `
                <div class="linha-header">
                    <h3 class="linha-nome">
                        <i class="fas fa-sync-alt"></i> ${numeroLinha}
                        <span class="circular-badge">Circular</span>
                    </h3>
                </div>
                <div class="linha-sentidos">
                    <div class="sentido">
                        <h4><i class="fas fa-arrow-right"></i> Ida: ${rotaIda[0].split('(')[0].trim()} → ${rotaIda[rotaIda.length - 1].split('(')[0].trim()}</h4>
                        <button class="btn-ver-rota" data-origem="${rotaIda[0]}" data-destino="${rotaIda[rotaIda.length - 1]}" data-travelmode="driving">
                            <i class="fas fa-map-marked-alt"></i> Ver ida
                        </button>
                    </div>
                    <div class="sentido">
                        <h4><i class="fas fa-arrow-left"></i> Volta: ${rotaVolta[0].split('(')[0].trim()} → ${rotaVolta[rotaVolta.length - 1].split('(')[0].trim()}</h4>
                        <button class="btn-ver-rota" data-origem="${rotaVolta[0]}" data-destino="${rotaVolta[rotaVolta.length - 1]}" data-travelmode="driving">
                            <i class="fas fa-map-marked-alt"></i> Ver volta
                        </button>
                    </div>
                </div>
                <div class="linha-horarios">${formatarHorarios(linha.horarios)}</div>
            `;
        } else if (linha.rotas && linha.rotas.length > 1 && linha.rotas[0] !== linha.rotas[linha.rotas.length - 1]) {
            const meio = Math.floor(linha.rotas.length / 2);
            const rotaIda = linha.rotas.slice(0, meio);
            const rotaVolta = linha.rotas.slice(meio);
            card.innerHTML = `
                <div class="linha-header">
                    <h3 class="linha-nome"><i class="fas ${icon}"></i> ${numeroLinha}</h3>
                </div>
                <div class="linha-sentidos">
                    <div class="sentido">
                        <h4><i class="fas fa-arrow-right"></i> Ida: ${rotaIda[0].split('(')[0].trim()} → ${rotaIda[rotaIda.length - 1].split('(')[0].trim()}</h4>
                        <button class="btn-ver-rota" data-origem="${rotaIda[0]}" data-destino="${rotaIda[rotaIda.length - 1]}">
                            <i class="fas fa-map-marked-alt"></i> Ver rota
                        </button>
                    </div>
                    <div class="sentido">
                        <h4><i class="fas fa-arrow-left"></i> Volta: ${rotaVolta[0].split('(')[0].trim()} → ${rotaVolta[rotaVolta.length - 1].split('(')[0].trim()}</h4>
                        <button class="btn-ver-rota" data-origem="${rotaVolta[0]}" data-destino="${rotaVolta[rotaVolta.length - 1]}">
                            <i class="fas fa-map-marked-alt"></i> Ver rota
                        </button>
                    </div>
                </div>
                <div class="linha-horarios">${formatarHorarios(linha.horarios)}</div>
            `;
        } else {
            card.innerHTML = `
                <div class="linha-header">
                    <h3 class="linha-nome"><i class="fas ${icon}"></i> ${numeroLinha}</h3>
                </div>
                <div class="linha-horarios">${formatarHorarios(linha.horarios)}</div>
                ${linha.rotas ? `<div class="rota-preview">
                    <span>Rota:</span> ${linha.rotas[0].split('(')[0].trim()} → ${linha.rotas[linha.rotas.length - 1].split('(')[0].trim()}
                    <button class="btn-ver-rota" data-origem="${linha.rotas[0]}" data-destino="${linha.rotas[linha.rotas.length - 1]}">
                        <i class="fas fa-map-marked-alt"></i> Ver rota completa
                    </button>
                </div>` : ''}
            `;
        }
        card.querySelectorAll('.btn-ver-rota').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const origem = encodeURIComponent(btn.dataset.origem.split('(')[0].trim());
                const destino = encodeURIComponent(btn.dataset.destino.split('(')[0].trim());
                const modo = btn.dataset.travelmode || "transit";
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=${modo}`, '_blank');
            });
        });
        card.addEventListener('click', () => {
            linhaSelecionada = linha;
            mostrarDetalhesLinha(linha);
        });
        resultadoContainer.appendChild(card);
    });
}
function mostrarDetalhesLinha(linha) {
        const titulo = document.getElementById('linhaTitulo');
        const horarios = document.getElementById('linhaHorarios');
        const rotaCompleta = document.getElementById('rotaCompleta');
        const numeroLinha = linha.numero || linha.nome || 'Linha sem identificação';
        const icon = getTransportIcon(linha);
        titulo.innerHTML = `<i class="fas ${icon}"></i> ${numeroLinha}`;
        if (linha.horarios && Array.isArray(linha.horarios)) {
            horarios.innerHTML = linha.horarios.map(horario => {
                return `<span><i class="far fa-clock"></i> ${horario}</span>`;
            }).join('');
        } else if (linha.horarios) {
            horarios.innerHTML = `<span><i class="far fa-clock"></i> ${linha.horarios}</span>`;
        } else {
            horarios.innerHTML = '<span><i class="far fa-clock"></i> Horários não disponíveis</span>';
        }
        if (linha.rotas && linha.rotas.length > 0) {
            rotaCompleta.innerHTML = linha.rotas.map((parada, index) => {
                const nomeParada = parada.split('(')[0].trim();
                return `
                    <div class="rota-step">
                        <strong>
                            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nomeParada)}" 
                               target="_blank" class="parada-link">
                                ${nomeParada}
                            </a>
                        </strong>
                    </div>
                `;
            }).join('');
            btnVerRota.onclick = () => {
                const origem = encodeURIComponent(linha.rotas[0].split('(')[0].trim());
                const destino = encodeURIComponent(linha.rotas[linha.rotas.length - 1].split('(')[0].trim());
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=transit`, '_blank');
            };
        } else {
            rotaCompleta.innerHTML = '<p>Rota não disponível</p>';
            btnVerRota.style.display = 'none';
        }
        detalhesLinhaModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    async function iniciarAvaliacao() {
        if (!navigator.geolocation) {
            mostrarFeedback("Seu navegador não suporta geolocalização.", 'error');
            return;
        }
        mostrarFeedback("Obtendo sua localização...", 'info');
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
            const { latitude, longitude } = position.coords;
            localizacaoAtual = { latitude, longitude };
            paradaAtual = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
            localizacaoAtualEl.innerHTML = `
                <div class="localizacao-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}</span>
                </div>
            `;
            try {
                const endereco = await obterEndereco(latitude, longitude);
                localizacaoAtualEl.innerHTML += `<div class="localizacao-info"><i class="fas fa-road"></i> <span>${endereco}</span></div>`;
            } catch (e) {
                console.error("Erro ao obter endereço:", e);
            }
            await verificarAvaliacaoExistente(paradaAtual);
            await verificarAvaliacoesProximas(latitude, longitude);
            modalSeguranca.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error("Erro na geolocalização:", error);
            let mensagem = "Erro ao obter localização.";
            if (error.code === error.PERMISSION_DENIED) {
                mensagem = "Permissão de localização negada. Por favor, habilite para avaliar.";
            } else if (error.code === error.TIMEOUT) {
                mensagem = "Tempo esgotado ao tentar obter localização.";
            }
            mostrarFeedback(mensagem, 'error');
        }
    }
    async function verificarAvaliacoesProximas(latitude, longitude) {
        try {
            const response = await fetch('/api/avaliacoes/proximas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude, longitude, raio: 0.3 })
            });
            const { data } = await response.json();
            if (data && data.length > 0) {
                const maisProxima = data[0];
                mostrarNotificacaoSeguranca(maisProxima);
            }
        } catch (error) {
            console.error("Erro ao verificar avaliações próximas:", error);
        }
    }
    function mostrarNotificacaoSeguranca(avaliacao) {
        const mensagens = {
            segura: "A parada mais próxima de você foi avaliada como SEGURA",
            media: "A parada mais próxima de você foi avaliada com segurança MÉDIA",
            insegura: "Cuidado! A parada mais próxima de você foi avaliada como INSEGURA"
        };
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao-seguranca ${avaliacao.avaliacao}`;
        notificacao.innerHTML = `
            <div class="notificacao-conteudo">
                <i class="fas ${avaliacao.avaliacao === 'insegura' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span>${mensagens[avaliacao.avaliacao]}</span>
                <button class="fechar-notificacao">&times;</button>
            </div>
            ${avaliacao.comentario ? `<div class="notificacao-comentario">"${avaliacao.comentario}"</div>` : ''}
        `;
        feedbackContainer.appendChild(notificacao);
        setTimeout(() => {
            notificacao.classList.add('fade-out');
            setTimeout(() => notificacao.remove(), 500);
        }, 10000);
        notificacao.querySelector('.fechar-notificacao').addEventListener('click', () => {
            notificacao.classList.add('fade-out');
            setTimeout(() => notificacao.remove(), 500);
        });
    }
    async function obterEndereco(latitude, longitude) {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
        const data = await response.json();
        if (data.address) {
            const { road, suburb, city } = data.address;
            return [road, suburb, city].filter(Boolean).join(', ');
        }
        return "Localização desconhecida";
    }
    async function verificarAvaliacaoExistente(coordId) {
        try {
            const anterior = await buscarAvaliacaoNoBanco(coordId);
            if (anterior) {
                avaliacaoSelecionada = anterior.avaliacao;
                comentarioInput.value = anterior.comentario || '';
                avaliacaoAnonima.checked = anterior.anonimo || false;
                opcoesAvaliacao.forEach(opcao => {
                    if (opcao.dataset.avaliacao === avaliacaoSelecionada) {
                        opcao.classList.add('selected');
                    }
                });
                enviarBtn.disabled = false;
                removerBtn.style.display = 'inline-flex';
                mostrarFeedback(`Você já avaliou esta parada como: ${formatarAvaliacao(avaliacaoSelecionada)}`, 'info');
            } else {
                resetarFormulario();
            }
        } catch (error) {
            console.error("Erro ao verificar avaliação existente:", error);
            resetarFormulario();
        }
    }
    async function buscarAvaliacaoNoBanco(coordId) {
        const response = await fetch('/api/avaliacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coordId })
        });
        if (!response.ok) throw new Error('Erro ao buscar avaliação');
        return await response.json();
    }
    async function salvarAvaliacaoNoBanco(avaliacao) {
        const response = await fetch('/api/avaliacoes/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(avaliacao)
        });
        if (!response.ok) throw new Error('Erro ao salvar no banco de dados');
        return await response.json();
    }
    async function removerAvaliacaoDoBanco(coordId) {
        const response = await fetch('/api/avaliacoes/remover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coordId })
        });
        if (!response.ok) throw new Error('Erro ao remover do banco de dados');
        return await response.json();
    }
    function validarFormulario() {
        enviarBtn.disabled = !avaliacaoSelecionada;
    }
    function resetarFormulario() {
        opcoesAvaliacao.forEach(o => o.classList.remove('selected'));
        comentarioInput.value = '';
        avaliacaoAnonima.checked = false;
        avaliacaoSelecionada = null;
        enviarBtn.disabled = true;
        removerBtn.style.display = 'none';
        feedback.textContent = '';
    }
    function formatarAvaliacao(tipo) {
        const formatos = {
            segura: "🟢 Segura",
            media: "🟡 Média",
            insegura: "🔴 Insegura"
        };
        return formatos[tipo] || tipo;
    }
    function mostrarFeedback(mensagem, tipo = 'info') {
        feedback.textContent = mensagem;
        feedback.className = `feedback-avaliacao ${tipo}`;
    }
    function fecharModal() {
        modalSeguranca.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetarFormulario();
    }
    async function enviarAvaliacao() {
        if (!avaliacaoSelecionada || !paradaAtual) return;
        const comentario = comentarioInput.value.trim();
        const anonimo = avaliacaoAnonima.checked;
        const avaliacao = {
            id: paradaAtual,
            latitude: localizacaoAtual.latitude,
            longitude: localizacaoAtual.longitude,
            avaliacao: avaliacaoSelecionada,
            comentario,
            anonimo,
            timestamp: new Date().toISOString()
        };
        try {
            await salvarAvaliacaoNoBanco(avaliacao);
            const mensagens = {
                segura: "Obrigado por avaliar esta parada como segura!",
                media: "Obrigado por avaliar esta parada com segurança média!",
                insegura: "Obrigado por alertar sobre esta parada insegura!"
            };
            mostrarFeedback(mensagens[avaliacaoSelecionada], 'success');
            removerBtn.style.display = 'inline-flex';
            setTimeout(() => {
                fecharModal();
            }, 3000);
        } catch (error) {
            console.error("Erro ao enviar avaliação:", error);
            mostrarFeedback("Erro ao enviar avaliação. Tente novamente.", 'error');
        }
    }
    async function removerAvaliacao() {
        if (!paradaAtual) return;
        try {
            await removerAvaliacaoDoBanco(paradaAtual);
            mostrarFeedback("Avaliação removida com sucesso.", 'success');
            setTimeout(() => fecharModal(), 1500);
        } catch (error) {
            console.error("Erro ao remover avaliação:", error);
            mostrarFeedback("Erro ao remover avaliação. Tente novamente.", 'error');
        }
    }
    carregarLocais();
    filtroLocal.addEventListener('change', filtrarPorLocal);
    async function carregarLocais() {
        try {
            const res = await fetch('/api/linhas');
            const { data } = await res.json();
            const locaisSet = new Set();
            data.forEach(linha => {
                if (linha.rotas) {
                    linha.rotas.forEach(rota => {
                        const nomeParada = rota.split('(')[0].trim();
                        if (nomeParada && !/^\d/.test(nomeParada)) {
                            locaisSet.add(nomeParada);
                        }
                    });
                }
            });
            const locais = Array.from(locaisSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
            locais.forEach(local => {
                const option = document.createElement('option');
                option.value = local;
                option.textContent = local;
                filtroLocal.appendChild(option);
            });
        } catch (err) {
            console.error('Erro ao carregar locais:', err);
        }
    }
    async function filtrarPorLocal() {
        const local = filtroLocal.value;
        try {
            const res = await fetch(`/api/linhas/pesquisa?bairro=${encodeURIComponent(local)}`);
            const { data } = await res.json();
            exibirResultados(data);
        } catch (err) {
            console.error('Erro ao filtrar por local:', err);
            resultadoContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Erro ao filtrar linhas. Tente novamente.</p>
                </div>
            `;
        }
    }
});
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const numero = urlParams.get('numero');
    const nome = urlParams.get('nome');
    const origem = urlParams.get('origem');
    const destino = urlParams.get('destino');
    if (numero || nome) {
        const pesquisaInput = document.getElementById('pesquisaLinha');
        pesquisaInput.value = numero || nome || '';
        setTimeout(() => {
            document.getElementById('btnPesquisar').click();
            setTimeout(() => {
                const cards = document.querySelectorAll('.linha-card');
                if (cards.length === 1) {
                    cards[0].click();
                }
            }, 1000);
        }, 500);
    }
    if (origem || destino) {
        if (document.getElementById('origem')) {
            document.getElementById('origem').value = origem || '';
        }
        if (document.getElementById('destino')) {
            document.getElementById('destino').value = destino || '';
        }
        if (origem && destino && document.getElementById('btnPesquisarRota')) {
            setTimeout(() => {
                document.getElementById('btnPesquisarRota').click();
            }, 500);
        }
    }
};