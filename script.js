// Configuração inicial
let isRecording = false;
let recordedBeats = [];
let startTime = 0;
let currentVolume = 0.7;

// Elementos do DOM
const drumPads = document.querySelectorAll('.drum-pad');
const recordBtn = document.getElementById('recordBtn');
const playBtn = document.getElementById('playBtn');
const clearBtn = document.getElementById('clearBtn');
const volumeControl = document.getElementById('volumeControl');
const keyDisplay = document.getElementById('keyDisplay');
const kitSelect = document.getElementById('kitSelect');

// Mapeamento de teclas
const keyMap = {
    'KeyQ': 'q', 'KeyW': 'w', 'KeyE': 'e',
    'KeyA': 'a', 'KeyS': 's', 'KeyD': 'd',
    'KeyZ': 'z', 'KeyX': 'x', 'KeyC': 'c'
};

// Função principal para tocar som
function playSound(key) {
    const pad = document.querySelector(`.drum-pad[data-key="${key}"]`);
    if (!pad) {
        console.log(`Pad não encontrado para a tecla: ${key}`);
        return;
    }

    let audio = pad.querySelector('audio');

    // Correção específica para a tecla "s"
    if (key === 's') {
        audio = new Audio('sounds/keys.wav');
    }

    if (!audio) {
        console.log(`Áudio não encontrado no pad: ${key}`);
        return;
    }

    console.log(`Tocando som: ${key} - ${audio.src}`);

    audio.currentTime = 0;
    audio.volume = currentVolume;
    
    audio.play()
        .then(() => {
            console.log(`✅ Som tocado com sucesso: ${key}`);
        })
        .catch(error => {
            console.error(`❌ Erro ao reproduzir áudio ${key}:`, error);
            audio.load();
        });

    pad.classList.add('active');
    setTimeout(() => {
        pad.classList.remove('active');
    }, 150);

    showKeyDisplay(key.toUpperCase());

    if (isRecording) {
        const timestamp = Date.now() - startTime;
        recordedBeats.push({ key, timestamp });
    }
}

// Função para mostrar a tecla pressionada na tela
function showKeyDisplay(key) {
    keyDisplay.textContent = key;
    keyDisplay.classList.add('show');
    
    setTimeout(() => {
        keyDisplay.classList.remove('show');
    }, 800);
}

// Event listeners para teclas do teclado
document.addEventListener('keydown', (e) => {
    const key = keyMap[e.code];
    if (key) {
        e.preventDefault();
        playSound(key);
    }
});

// Event listeners para cliques nos pads
drumPads.forEach(pad => {
    pad.addEventListener('click', () => {
        const key = pad.getAttribute('data-key');
        playSound(key);
    });
});

// Controle de volume
volumeControl.addEventListener('input', (e) => {
    currentVolume = e.target.value / 100;
    console.log(`Volume alterado para: ${Math.round(currentVolume * 100)}%`);
    
    drumPads.forEach(pad => {
        const audio = pad.querySelector('audio');
        if (audio) {
            audio.volume = currentVolume;
        }
    });
});

// Gravação
recordBtn.addEventListener('click', () => {
    if (!isRecording) {
        isRecording = true;
        recordedBeats = [];
        startTime = Date.now();
        recordBtn.textContent = '⏹️ Parar';
        recordBtn.classList.add('recording');
        playBtn.disabled = true;
        console.log('🔴 Gravação iniciada');
    } else {
        isRecording = false;
        recordBtn.textContent = '🔴 Gravar';
        recordBtn.classList.remove('recording');
        playBtn.disabled = recordedBeats.length === 0;
        console.log(`⏹️ Gravação parada. ${recordedBeats.length} beats gravados`);
    }
});

// Reprodução
playBtn.addEventListener('click', () => {
    if (recordedBeats.length === 0) return;

    playBtn.disabled = true;
    recordBtn.disabled = true;
    playBtn.textContent = '▶️ Reproduzindo...';
    console.log(`▶️ Reproduzindo ${recordedBeats.length} beats`);

    recordedBeats.forEach(beat => {
        setTimeout(() => {
            playSound(beat.key);
        }, beat.timestamp);
    });

    const lastBeatTime = recordedBeats[recordedBeats.length - 1].timestamp;
    setTimeout(() => {
        playBtn.disabled = false;
        recordBtn.disabled = false;
        playBtn.textContent = '▶️ Reproduzir';
        console.log('▶️ Reprodução finalizada');
    }, lastBeatTime + 1000);
});

// Limpar gravação
clearBtn.addEventListener('click', () => {
    recordedBeats = [];
    playBtn.disabled = true;
    isRecording = false;
    recordBtn.textContent = '🔴 Gravar';
    recordBtn.classList.remove('recording');
    playBtn.textContent = '▶️ Reproduzir';
    console.log('🗑️ Gravação limpa');
});

// Kit de bateria (futuro)
kitSelect.addEventListener('change', (e) => {
    console.log('Kit selecionado:', e.target.value);
});

// Teste de todos os sons
function testAllSounds() {
    const keys = ['q', 'w', 'e', 'a', 's', 'd', 'z', 'x', 'c'];
    let index = 0;
    
    console.log('🔊 Testando todos os sons...');
    
    function playNext() {
        if (index < keys.length) {
            console.log(`Testando som ${index + 1}/9: ${keys[index]}`);
            playSound(keys[index]);
            index++;
            setTimeout(playNext, 800);
        } else {
            console.log('✅ Teste de todos os sons finalizado');
        }
    }
    
    playNext();
}

// Verificação de arquivos de áudio
function checkAudioFiles() {
    console.log('📁 Verificando arquivos de áudio...');
    
    drumPads.forEach(pad => {
        const key = pad.getAttribute('data-key');
        const audio = pad.querySelector('audio');
        
        if (audio) {
            console.log(`Áudio ${key}:`, {
                src: audio.src,
                readyState: audio.readyState,
                duration: audio.duration,
                error: audio.error
            });
        }
    });
}

// 🔓 Liberação de áudio em dispositivos móveis
// Essa função é executada no primeiro toque na tela para liberar o uso de áudio
document.addEventListener('touchstart', () => {
    const audio = new Audio();
    audio.play().catch(() => {});
}, { once: true });

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('🥁 Bateria Virtual Pro carregada!');
    
    currentVolume = volumeControl.value / 100;
    console.log(`Volume inicial: ${Math.round(currentVolume * 100)}%`);
    
    let loadedCount = 0;
    const totalAudios = drumPads.length;
    
    drumPads.forEach(pad => {
        const audio = pad.querySelector('audio');
        if (audio) {
            audio.volume = currentVolume;

            audio.addEventListener('canplaythrough', () => {
                loadedCount++;
                console.log(`✅ Áudio carregado (${loadedCount}/${totalAudios}): ${audio.src}`);
                if (loadedCount === totalAudios) {
                    console.log('🎉 Todos os áudios carregados com sucesso!');
                }
            });

            audio.addEventListener('error', (e) => {
                console.error(`❌ Erro ao carregar áudio: ${audio.src}`, e);
            });

            audio.load();
        }
    });

    window.testAllSounds = testAllSounds;
    window.checkAudioFiles = checkAudioFiles;

    console.log('💡 Dicas:');
    console.log('- Digite "testAllSounds()" no console para testar todos os sons');
    console.log('- Digite "checkAudioFiles()" no console para verificar os arquivos');
});

// Previne comportamento padrão
document.addEventListener('keydown', (e) => {
    if (keyMap[e.code]) {
        e.preventDefault();
    }
});

// Efeito visual para mobile
drumPads.forEach(pad => {
    pad.addEventListener('touchstart', (e) => {
        e.preventDefault();
        pad.classList.add('active');
    });
    
    pad.addEventListener('touchend', (e) => {
        e.preventDefault();
        setTimeout(() => {
            pad.classList.remove('active');
        }, 150);
    });
});
