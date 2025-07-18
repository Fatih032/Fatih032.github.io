// Görev sistemi
window.questSystem = {
    // Aktif görevler
    activeQuests: [],
    
    // Tamamlanan görevler
    completedQuests: [],
    
    // Görev tipleri ve açıklamaları
    questTypes: {
        KILL_ENEMIES: "Düşman öldür",
        COLLECT_COINS: "Altın topla",
        SURVIVE_TIME: "Hayatta kal",
        COMPLETE_LEVELS: "Bölüm tamamla",
        DEFEAT_BOSS: "Boss yenme",
        USE_DASH: "Dash kullan",
        COLLECT_POWERUPS: "Güçlendirme topla"
    },
    
    // Görev havuzu - Oyun içinde rastgele seçilecek görevler
    questPool: [
        { 
            id: "q1", 
            type: "KILL_ENEMIES", 
            target: 10, 
            progress: 0, 
            reward: 20, 
            description: "10 düşman öldür",
            difficulty: "easy"
        },
        { 
            id: "q2", 
            type: "COLLECT_COINS", 
            target: 15, 
            progress: 0, 
            reward: 15, 
            description: "15 altın topla",
            difficulty: "easy"
        },
        { 
            id: "q3", 
            type: "COMPLETE_LEVELS", 
            target: 3, 
            progress: 0, 
            reward: 30, 
            description: "3 bölüm tamamla",
            difficulty: "medium"
        },
        { 
            id: "q4", 
            type: "DEFEAT_BOSS", 
            target: 1, 
            progress: 0, 
            reward: 25, 
            description: "1 boss yenme",
            difficulty: "medium"
        },
        { 
            id: "q5", 
            type: "USE_DASH", 
            target: 5, 
            progress: 0, 
            reward: 10, 
            description: "5 kez dash kullan",
            difficulty: "easy"
        },
        { 
            id: "q6", 
            type: "KILL_ENEMIES", 
            target: 25, 
            progress: 0, 
            reward: 35, 
            description: "25 düşman öldür",
            difficulty: "hard"
        },
        { 
            id: "q7", 
            type: "COLLECT_POWERUPS", 
            target: 2, 
            progress: 0, 
            reward: 20, 
            description: "2 güçlendirme topla",
            difficulty: "medium"
        },
        { 
            id: "q8", 
            type: "SURVIVE_TIME", 
            target: 60, // 60 saniye
            progress: 0, 
            reward: 15, 
            description: "60 saniye hayatta kal",
            difficulty: "medium"
        }
    ],
    
    // Görev sistemini başlat
    initialize: function() {
        this.assignRandomQuests(3); // Oyun başlangıcında 3 rastgele görev ata
        this.setupQuestUI(); // Görev arayüzünü hazırla
    },
    
    // Rastgele görevler ata
    assignRandomQuests: function(count) {
        // Mevcut aktif görevleri temizle
        this.activeQuests = [];
        
        // Görev havuzundan rastgele görevler seç
        const availableQuests = [...this.questPool].filter(q => !this.completedQuests.includes(q.id));
        
        for (let i = 0; i < Math.min(count, availableQuests.length); i++) {
            const randomIndex = Math.floor(Math.random() * availableQuests.length);
            const selectedQuest = {...availableQuests[randomIndex]};
            selectedQuest.progress = 0; // İlerlemeyi sıfırla
            this.activeQuests.push(selectedQuest);
            availableQuests.splice(randomIndex, 1); // Seçilen görevi havuzdan çıkar
        }
        
        // Görev arayüzünü güncelle
        this.updateQuestUI();
    },
    
    // Görev ilerlemesini güncelle
    updateQuestProgress: function(questType, amount = 1) {
        let questCompleted = false;
        
        this.activeQuests.forEach(quest => {
            if (quest.type === questType && quest.progress < quest.target) {
                quest.progress += amount;
                
                // Görev tamamlandı mı kontrol et
                if (quest.progress >= quest.target) {
                    quest.progress = quest.target; // İlerlemeyi hedefle sınırla
                    this.completeQuest(quest);
                    questCompleted = true;
                }
            }
        });
        
        // Görev arayüzünü güncelle
        this.updateQuestUI();
        
        return questCompleted;
    },
    
    // Görevi tamamla ve ödülü ver
    completeQuest: function(quest) {
        // Ödülü ver
        gameState.coinCount += quest.reward;
        
        // Tamamlanan görevler listesine ekle
        this.completedQuests.push(quest.id);
        
        // Bildirim göster
        this.showQuestNotification(`Görev Tamamlandı: ${quest.description}`, `+${quest.reward} altın kazandınız!`);
        
        // Ses çal
        if (typeof playSound === "function") {
            playSound('powerup');
        }
        
        // Aktif görevlerden kaldır
        this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
        
        // Yeni görev ekle (eğer havuzda görev kaldıysa)
        const availableQuests = this.questPool.filter(q => 
            !this.completedQuests.includes(q.id) && 
            !this.activeQuests.some(aq => aq.id === q.id)
        );
        
        if (availableQuests.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableQuests.length);
            const newQuest = {...availableQuests[randomIndex]};
            newQuest.progress = 0;
            this.activeQuests.push(newQuest);
            
            // Yeni görev bildirimini göster
            setTimeout(() => {
                this.showQuestNotification("Yeni Görev", newQuest.description);
            }, 2000);
        }
    },
    
    // Görev arayüzünü hazırla
    setupQuestUI: function() {
        // Görev panelini oluştur
        const questPanel = document.createElement('div');
        questPanel.id = 'questPanel';
        questPanel.className = 'quest-panel';
        document.body.appendChild(questPanel);
        
        // Görev başlığı
        const questTitle = document.createElement('div');
        questTitle.className = 'quest-title';
        questTitle.innerHTML = '<h3>Görevler</h3>';
        questPanel.appendChild(questTitle);
        
        // Görev listesi
        const questList = document.createElement('div');
        questList.id = 'questList';
        questList.className = 'quest-list';
        questPanel.appendChild(questList);
        
        // Görev panelini aç/kapat butonu
        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggleQuestPanel';
        toggleButton.className = 'toggle-quest-button';
        toggleButton.innerHTML = '📋';
        toggleButton.title = 'Görevleri Göster/Gizle';
        document.body.appendChild(toggleButton);
        
        // Buton tıklama olayı
        toggleButton.addEventListener('click', () => {
            if (questPanel.style.right === '0px' || questPanel.style.right === '') {
                questPanel.style.right = '-250px';
            } else {
                questPanel.style.right = '0px';
            }
        });
        
        // İlk başta görev panelini gizle
        questPanel.style.right = '-250px';
    },
    
    // Görev arayüzünü güncelle
    updateQuestUI: function() {
        const questList = document.getElementById('questList');
        if (!questList) return;
        
        // Görev listesini temizle
        questList.innerHTML = '';
        
        // Aktif görevleri listele
        this.activeQuests.forEach(quest => {
            const questItem = document.createElement('div');
            questItem.className = 'quest-item';
            
            // Zorluk seviyesine göre renk
            let difficultyColor = '#4caf50'; // Kolay - yeşil
            if (quest.difficulty === 'medium') difficultyColor = '#ff9800'; // Orta - turuncu
            if (quest.difficulty === 'hard') difficultyColor = '#f44336'; // Zor - kırmızı
            
            // İlerleme yüzdesi
            const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);
            
            questItem.innerHTML = `
                <div class="quest-info">
                    <div class="quest-desc">${quest.description}</div>
                    <div class="quest-reward">Ödül: ${quest.reward} 🪙</div>
                </div>
                <div class="quest-progress-container">
                    <div class="quest-progress-bar" style="width: ${progressPercent}%; background-color: ${difficultyColor}"></div>
                    <div class="quest-progress-text">${quest.progress}/${quest.target}</div>
                </div>
            `;
            
            questList.appendChild(questItem);
        });
        
        // Görev yoksa bilgi mesajı göster
        if (this.activeQuests.length === 0) {
            const noQuestMsg = document.createElement('div');
            noQuestMsg.className = 'no-quest-msg';
            noQuestMsg.textContent = 'Tüm görevler tamamlandı!';
            questList.appendChild(noQuestMsg);
        }
    },
    
    // Görev bildirimini göster
    showQuestNotification: function(title, message) {
        const notification = document.createElement('div');
        notification.className = 'quest-notification';
        notification.innerHTML = `
            <div class="quest-notification-title">${title}</div>
            <div class="quest-notification-message">${message}</div>
        `;
        document.body.appendChild(notification);
        
        // Animasyon ile göster
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
            
            // 4 saniye sonra kaldır
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(120%)';
                
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }, 4000);
        }, 100);
    },
    
    // Süre bazlı görevleri güncelle (her saniye çağrılmalı)
    updateTimeBasedQuests: function() {
        this.updateQuestProgress("SURVIVE_TIME");
    }
};

// Oyun başladığında görev sistemini başlat
document.addEventListener('DOMContentLoaded', () => {
    // Oyun başladığında görev sistemini başlatmak için startGame fonksiyonuna ekleme yapılmalı
});