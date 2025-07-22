// Configuração inicial
let isRecording = false;
let recordedBeats = [];
let startTime = 0;
let currentVolume = 0.7;

const volumeGain = {
    'q': 3.5,  
    'w': 1.0,  
    'e': 1.0,  
    'a': 1.0,  
    's': 1.0,  
    'd': 1.0,  
    'z': 1.0,  
    'x': 1.0,  
    'c': 1.0   
};

const drumPads = document.querySelectorAll('.drum-pad');
const recordBtn = document.getElementById('recordBtn');
const playBtn = document.getElementById('playBtn');
const clearBtn = document.getElementById('clearBtn');
const volumeControl = document.getElementById('volumeControl');
const keyDisplay = document.getElementById('keyDisplay');
const kitSelect = document.getElementById('kitSelect');
const demoBtn = document.getElementById('demoBtn');

const drumSoloDemo = [
    
    { key: 'q', timestamp: 0 },     
    { key: 's', timestamp: 250 },   
    { key: 'q', timestamp: 500 },   
    { key: 's', timestamp: 750 },   
    
    { key: 'w', timestamp: 1000 },  
    { key: 'q', timestamp: 1000 },  
    { key: 'w', timestamp: 1125 },  
    { key: 's', timestamp: 1250 },  
    { key: 'w', timestamp: 1375 },  
    
    { key: 'q', timestamp: 1500 },  
    { key: 'w', timestamp: 1500 },  
    { key: 'a', timestamp: 1625 },  
    { key: 'w', timestamp: 1750 },  
    { key: 's', timestamp: 1750 },  
    { key: 'd', timestamp: 1875 },  
    
    { key: 'a', timestamp: 2000 },  
    { key: 'a', timestamp: 2125 },  
    { key: 'd', timestamp: 2250 },  
    { key: 'z', timestamp: 2375 },  
    { key: 'z', timestamp: 2500 },  
    
    { key: 'e', timestamp: 2750 },  
    { key: 'q', timestamp: 2750 },  
    { key: 's', timestamp: 3000 },  
    { key: 'q', timestamp: 3125 },  
    { key: 'q', timestamp: 3250 },  
    
    { key: 'w', timestamp: 3375 },  
    { key: 'w', timestamp: 3438 },  
    { key: 'w', timestamp: 3500 },  
    { key: 'w', timestamp: 3563 },  
    { key: 's', timestamp: 3625 },  
    
    { key: 'a', timestamp: 3750 },  
    { key: 'd', timestamp: 3813 },  
    { key: 'z', timestamp: 3875 },  
    { key: 'a', timestamp: 3938 },  
    { key: 'd', timestamp: 4000 },  
    
    { key: 'q', timestamp: 4250 },  
    { key: 'e', timestamp: 4250 },  
    { key: 's', timestamp: 4500 },  
    { key: 'c', timestamp: 4500 },  
    { key: 'q', timestamp: 4750 },  
    { key: 'e', timestamp: 4750 },  
];

function playDrumSolo() {
    console.log('🎵 Iniciando solo de bateria demonstrativo...');
    
    if (demoBtn) demoBtn.disabled = true;
    if (playBtn) playBtn.disabled = true;
    if (recordBtn) recordBtn.disabled = true;
    
    if (demoBtn) demoBtn.textContent = '🎵 Tocando Solo...';
    
    drumSoloDemo.forEach(beat => {
        setTimeout(() => {
            playSound(beat.key);
        }, beat.timestamp);
    });
    
    const soloDuration = drumSoloDemo[drumSoloDemo.length - 1].timestamp;
    
    setTimeout(() => {
        if (demoBtn) {
            demoBtn.disabled = false;
            demoBtn.textContent = '🎵 Solo Demo';
        }
        if (playBtn) playBtn.disabled = recordedBeats.length === 0;
        if (recordBtn) recordBtn.disabled = false;
        
        console.log('🎉 Solo de bateria finalizado!');
    }, soloDuration + 1000);
}

const keyMap = {
    'KeyQ': 'q', 'KeyW': 'w', 'KeyE': 'e',
    'KeyA': 'a', 'KeyS': 's', 'KeyD': 'd',
    'KeyZ': 'z', 'KeyX': 'x', 'KeyC': 'c'
};

let mobileAudioEnabled = false;
let audioPool = {};

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0);
}

function createAudioPool() {
    const keys = ['q', 'w', 'e', 'a', 's', 'd', 'z', 'x', 'c'];
    
    keys.forEach(key => {
        audioPool[key] = new Audio(`sounds/key${key}.wav`);
        audioPool[key].preload = 'auto';
        audioPool[key].volume = Math.min(1.0, currentVolume * volumeGain[key]);
        audioPool[key].load();
    });
    
    console.log('🎵 Pool de áudios criado para dispositivos móveis');
}

function enableMobileAudio() {
    if (mobileAudioEnabled) return;
    
    console.log('🔓 Habilitando áudio para dispositivos móveis...');
    
    if (isMobileDevice()) {
        createAudioPool();
        
        Object.keys(audioPool).forEach(key => {
            const audio = audioPool[key];
            audio.volume = 0;
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = Math.min(1.0, currentVolume * volumeGain[key]);
                        console.log(`✅ Áudio ${key} habilitado para mobile`);
                    })
                    .catch(error => {
                        console.log(`❌ Erro ao habilitar ${key} no mobile:`, error);
                    });
            }
        });
    } else {
        drumPads.forEach(pad => {
            const audio = pad.querySelector('audio');
            if (audio) {
                audio.volume = 0;
                const playPromise = audio.play();
                
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            audio.pause();
                            audio.currentTime = 0;
                            const key = pad.getAttribute('data-key');
                            audio.volume = Math.min(1.0, currentVolume * volumeGain[key]);
                        })
                        .catch(() => {});
                }
            }
        });
    }
    
    mobileAudioEnabled = true;
    console.log('✅ Áudio habilitado com sucesso!');
}

document.addEventListener('click', enableMobileAudio, { once: true });
document.addEventListener('touchend', enableMobileAudio, { once: true });
document.addEventListener('keydown', enableMobileAudio, { once: true });

function playSound(key) {
    const pad = document.querySelector(`.drum-pad[data-key="${key}"]`);
    if (!pad) {
        console.log(`Pad não encontrado para a tecla: ${key}`);
        return;
    }

    let audio;

    if (isMobileDevice() && audioPool[key]) {
        audio = audioPool[key];
    } else {
        audio = pad.querySelector('audio');
        
        if (key === 's') {
            audio = new Audio('sounds/keys.wav');
        }
    }

    if (!audio) {
        console.log(`Áudio não encontrado no pad: ${key}`);
        return;
    }

    console.log(`Tocando som: ${key} - ${audio.src || 'pool audio'}`);

    audio.currentTime = 0;
    audio.volume = Math.min(1.0, currentVolume * volumeGain[key]);
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log(`✅ Som tocado com sucesso: ${key}`);
            })
            .catch(error => {
                console.error(`❌ Erro ao reproduzir áudio ${key}:`, error);
                
                if (!mobileAudioEnabled) {
                    enableMobileAudio();
                    setTimeout(() => playSound(key), 200);
                }
            });
    }

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

function showKeyDisplay(key) {
    keyDisplay.textContent = key;
    keyDisplay.classList.add('show');
    
    setTimeout(() => {
        keyDisplay.classList.remove('show');
    }, 800);
}

document.addEventListener('keydown', (e) => {
    const key = keyMap[e.code];
    if (key) {
        e.preventDefault();
        playSound(key);
    }
});

drumPads.forEach(pad => {
    pad.addEventListener('click', () => {
        const key = pad.getAttribute('data-key');
        playSound(key);
    });
});

volumeControl.addEventListener('input', (e) => {
    currentVolume = e.target.value / 100;
    console.log(`Volume alterado para: ${Math.round(currentVolume * 100)}%`);
    
    if (isMobileDevice() && audioPool) {
        Object.keys(audioPool).forEach(key => {
            audioPool[key].volume = Math.min(1.0, currentVolume * volumeGain[key]);
        });
    } else {
        drumPads.forEach(pad => {
            const audio = pad.querySelector('audio');
            if (audio) {
                const key = pad.getAttribute('data-key');
                audio.volume = Math.min(1.0, currentVolume * volumeGain[key]);
            }
        });
    }
});

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

clearBtn.addEventListener('click', () => {
    recordedBeats = [];
    playBtn.disabled = true;
    isRecording = false;
    recordBtn.textContent = '🔴 Gravar';
    recordBtn.classList.remove('recording');
    playBtn.textContent = '▶️ Reproduzir';
    console.log('🗑️ Gravação limpa');
});

kitSelect.addEventListener('change', (e) => {
    console.log('Kit selecionado:', e.target.value);
});

if (demoBtn) {
    demoBtn.addEventListener('click', playDrumSolo);
}


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

function checkAudioFiles() {
    console.log('📁 Verificando arquivos de áudio...');
    
    if (isMobileDevice() && audioPool) {
        Object.keys(audioPool).forEach(key => {
            const audio = audioPool[key];
            console.log(`Áudio ${key} (pool):`, {
                src: audio.src,
                readyState: audio.readyState,
                duration: audio.duration,
                error: audio.error
            });
        });
    } else {
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
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🥁 Bateria Virtual Pro carregada!');
    console.log(`📱 Dispositivo móvel detectado: ${isMobileDevice()}`);
    
    currentVolume = volumeControl.value / 100;
    console.log(`Volume inicial: ${Math.round(currentVolume * 100)}%`);
    
    if (!isMobileDevice()) {
        let loadedCount = 0;
        const totalAudios = drumPads.length;
        
        drumPads.forEach(pad => {
            const audio = pad.querySelector('audio');
            if (audio) {
                const key = pad.getAttribute('data-key');
                audio.volume = Math.min(1.0, currentVolume * volumeGain[key]);

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
    }

    window.testAllSounds = testAllSounds;
    window.checkAudioFiles = checkAudioFiles;
    window.playDrumSolo = playDrumSolo; 

    console.log('💡 Dicas:');
    console.log('- Digite "testAllSounds()" no console para testar todos os sons');
    console.log('- Digite "checkAudioFiles()" no console para verificar os arquivos');
    console.log('- Digite "playDrumSolo()" no console para tocar o solo demonstrativo'); // ✨ NOVO
    
    if (isMobileDevice()) {
        console.log('📱 IMPORTANTE: Toque na tela primeiro para habilitar o áudio!');
    }
});

document.addEventListener('keydown', (e) => {
    if (keyMap[e.code]) {
        e.preventDefault();
    }
});


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
        
        const key = pad.getAttribute('data-key');
        if (key && mobileAudioEnabled) {
            playSound(key);
        }
    });
});