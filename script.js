		let playerCount = 4;
        let scores = [];
        let roundCount = 0;
        let playerNames = [];
        // Biến lưu trữ lịch sử sử dụng LocalStorage
        let gameHistory = JSON.parse(localStorage.getItem('scoreGameHistory')) || [];

        // Khởi tạo ngay khi chạy trang
        window.onload = function() {
            generateNameInputs(4); // Mặc định 4 người
        };

        // 1. CẬP NHẬT UI KHI CHỌN SỐ NGƯỜI
        function updateSetupUI(num, element) {
            // Cập nhật giá trị
            document.getElementById('numPlayers').value = num;
            document.getElementById('customNumPlayers').value = num; // Đồng bộ input number
            
            // Highlight nút được chọn
            document.querySelectorAll('.player-option').forEach(opt => opt.classList.remove('active'));
            if(element) element.classList.add('active');

            // Tạo lại các ô nhập tên
            generateNameInputs(num);
        }

        // Hàm tạo ô input nhập tên
        function generateNameInputs(num) {
            const container = document.getElementById('name-inputs-area');
            container.innerHTML = ''; 

            for (let i = 1; i <= num; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'name-field';
                input.id = `name-p${i}`;
                input.placeholder = `Tên người ${i}`;
                input.autocomplete = "off";
                
                container.appendChild(input);
            }
        }

        // 2. BẮT ĐẦU GAME
        function startGame() {
            playerCount = parseInt(document.getElementById('numPlayers').value);
            scores = new Array(playerCount).fill(0);
            roundCount = 0;
            playerNames = [];
            document.getElementById('table-body').innerHTML = ''; // Reset bảng

            // Lấy tên từ các ô input
            for(let i = 1; i <= playerCount; i++) {
                let nameVal = document.getElementById(`name-p${i}`).value.trim();
                if(nameVal === "") nameVal = `P${i}`;
                playerNames.push(nameVal);
            }

            // Chuyển màn hình
            document.getElementById('setup-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('hidden');

            // Render giao diện bảng điểm
            renderGameUI();
            updateResults(); // Khởi tạo bảng xếp hạng ban đầu
        }

        // Render toàn bộ UI bảng điểm
        function renderGameUI() {
            const headerRow = document.getElementById('table-header');
            const totalRow = document.getElementById('total-row');
            const inputArea = document.getElementById('input-area');
            
            headerRow.innerHTML = '<th>#</th>';
            totalRow.innerHTML = '<td>TỔNG</td>';
            inputArea.innerHTML = '';

            playerNames.forEach((name, index) => {
                let pIndex = index + 1;
                
                headerRow.innerHTML += `<th>${name}</th>`;
                totalRow.innerHTML += `<td id="total-p${pIndex}">0</td>`;

                inputArea.innerHTML += `
                    <div class="input-group">
                        <label title="${name}">${name}</label>
                        <input type="number" class="score-input" id="input-p${pIndex}" placeholder="0">
                    </div>
                `;
            });
        }

        // 3. THÊM ĐIỂM
        function addRound() {
            roundCount++;
            const tbody = document.getElementById('table-body');
            let tr = document.createElement('tr');
            let rowHTML = `<td class="round-index">${roundCount}</td>`;
            
            for (let i = 1; i <= playerCount; i++) {
                let inputId = `input-p${i}`;
                let inputEl = document.getElementById(inputId);
                let val = parseInt(inputEl.value);

                if(isNaN(val)) val = 0; 
                
                scores[i-1] += val;
                rowHTML += `<td>${val}</td>`;

                inputEl.value = ''; 
                if(i===1) inputEl.focus(); 
            }

            tr.innerHTML = rowHTML;
            tbody.appendChild(tr);
            updateTotalDisplay();
			updateResults(); // Cập nhật xếp hạng sau mỗi vòng
        }

        function updateTotalDisplay() {
            for (let i = 1; i <= playerCount; i++) {
                document.getElementById(`total-p${i}`).innerText = scores[i-1];
            }
            const wrapper = document.querySelector('.table-wrapper');
            wrapper.scrollTop = wrapper.scrollHeight;
        }
		
		// ** 4. CẬP NHẬT KẾT QUẢ VÀ XẾP HẠNG **
        function updateResults() {
            // Cập nhật dòng tổng điểm
            for (let i = 1; i <= playerCount; i++) {
                document.getElementById(`total-p${i}`).innerText = scores[i-1];
            }
            
            // Tạo mảng dữ liệu để sắp xếp
            const rankingData = playerNames.map((name, index) => ({
                name: name,
                score: scores[index],
                index: index + 1
            }));
            
            // Sắp xếp: Điểm thấp nhất thắng (A - B)
            // Thay đổi thành (B - A) nếu Điểm CÀNG CAO CÀNG THẮNG
            rankingData.sort((a, b) => b.score - a.score);

            // Render danh sách xếp hạng
            const rankList = document.getElementById('rank-list');
            rankList.innerHTML = '';
            
            rankingData.forEach((player, rank) => {
                const rankIndex = rank + 1;
                let medal = '';
                let rankClass = '';

                if (rankIndex === 1) { medal = '🥇'; rankClass = 'rank-1'; } 
                else if (rankIndex === 2) { medal = '🥈'; rankClass = 'rank-2'; } 
                else if (rankIndex === 3) { medal = '🥉'; rankClass = 'rank-3'; } 
                else { medal = `R${rankIndex}.`; }

                const item = document.createElement('li');
                item.className = `rank-item ${rankClass}`;
                item.innerHTML = `
                    <div class="rank-player-info">
                        <span class="rank-medal">${medal}</span>
                        <span>${player.name}</span>
                    </div>
                    <span class="rank-score">${player.score}</span>
                `;
                rankList.appendChild(item);
            });
        }
        
        // ** 5. LƯU LỊCH SỬ **
        function saveGame() {
            // Tạo mảng xếp hạng cuối cùng (cao điểm nhất thắng)
            const finalRanking = playerNames.map((name, index) => ({
                name: name,
                score: scores[index]
            })).sort((a, b) => b.score - a.score);

            const gameRecord = {
                id: Date.now(),
                date: new Date().toLocaleString('vi-VN', { 
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
                }),
                playersCount: playerCount,
                ranking: finalRanking 
            };

            gameHistory.unshift(gameRecord); // Thêm vào đầu (mới nhất)
            localStorage.setItem('scoreGameHistory', JSON.stringify(gameHistory));
            alert(`Trận đấu đã được lưu thành công!`);
        }

        // ** 6. HIỂN THỊ LỊCH SỬ **
        function viewHistoryScreen() {
            document.getElementById('setup-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('history-screen').classList.remove('hidden');
            
            renderHistoryList();
        }

        function renderHistoryList() {
            const listContainer = document.getElementById('history-list');
            const noHistoryMsg = document.getElementById('no-history-message');
            listContainer.innerHTML = '';
            
            if (gameHistory.length === 0) {
                noHistoryMsg.classList.remove('hidden');
                return;
            }
            noHistoryMsg.classList.add('hidden');

            gameHistory.forEach((record) => {
                let playerListHTML = record.ranking.map((player, rank) => {
                    const rankEmoji = (rank === 0) ? '🏆' : '';
                    const rankClass = (rank === 0) ? 'history-rank-1' : '';

                    return `
                        <li class="history-player-item ${rankClass}">
                            <span>${rank + 1}. ${rankEmoji} ${player.name}</span>
                            <span class="history-score">${player.score} điểm</span>
                        </li>
                    `;
                }).join('');

                const firstPlayer = record.ranking[0];

                const itemHTML = `
                    <div class="history-item">
                        <div class="history-header">
                            <span>${record.playersCount} người chơi - **${firstPlayer.name}** Thắng</span>
                            <span class="history-date">${record.date}</span>
                        </div>
                        <ul class="history-players">
                            ${playerListHTML}
                        </ul>
                    </div>
                `;
                listContainer.innerHTML += itemHTML;
            });
        }

        // ** 7. CHỨC NĂNG HỖ TRỢ **
        function backToSetup() {
            document.getElementById('history-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.add('hidden');
            document.getElementById('setup-screen').classList.remove('hidden');
        }

        function clearHistory() {
            if(confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đấu?')) {
                gameHistory = [];
                localStorage.removeItem('scoreGameHistory');
                renderHistoryList(); 
            }
        }

        // 8. Cập nhật hàm RESET GAME
        function resetGame() {
            if (roundCount > 0) { // Chỉ hỏi lưu khi đã có ván chơi
                if(confirm('Trận đấu đang diễn ra. Bạn có muốn lưu kết quả trước khi kết thúc không?')) {
                    saveGame();
                }
            }
            
            // Quay về màn hình Setup và reset dữ liệu tạm thời
            backToSetup();
            document.getElementById('table-body').innerHTML = '';
            document.getElementById('rank-list').innerHTML = '';
            scores = []; // Đảm bảo scores được reset
            roundCount = 0;
        }