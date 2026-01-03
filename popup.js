document.addEventListener('DOMContentLoaded', () => {
  const categories = [
    'Information and Ideas',
    'Craft and Structure',
    'Expression of Ideas',
    'Standard English Conventions'
  ];

  // Load stored data and display
  function loadAndDisplayData() {
    chrome.storage.sync.get('satData', (result) => {
      const data = result.satData || { tests: [], mistakes: {0: 0, 1: 0, 2: 0, 3: 0} };
      
      // Populate table
      const tbody = document.querySelector('#results-table tbody');
      tbody.innerHTML = '';
      categories.forEach((cat, index) => {
        const row = `<tr><td>${cat}</td><td>${data.mistakes[index]}</td></tr>`;
        tbody.innerHTML += row;
      });
      
      // Create chart
      const ctx = document.getElementById('mistakes-chart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: categories,
          datasets: [{
            label: 'Mistakes',
            data: Object.values(data.mistakes),
            backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0']
          }]
        },
        options: { scales: { y: { beginAtZero: true } } }
      });
    });
  }

  loadAndDisplayData(); 

  
  document.getElementById('scan-dashboard').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: scanDashboard
      }, (results) => {
        if (results && results[0].result) {
          updateStorage(results[0].result, 'dashboard');
        }
      });
    });
  });

  
  document.getElementById('scan-review').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: scanReview
      }, (results) => {
        if (results && results[0].result) {
          updateStorage(results[0].result, 'review');
        }
      });
    });
  });

  
  document.getElementById('clear-data').addEventListener('click', () => {
    chrome.storage.sync.set({satData: {tests: [], mistakes: {0: 0, 1: 0, 2: 0, 3: 0}}}, () => {
      loadAndDisplayData();
      alert('Data cleared!');
    });
  });

  
  function updateStorage(newData, type) {
    chrome.storage.sync.get('satData', (result) => {
      let data = result.satData || {tests: [], mistakes: {0: 0, 1: 0, 2: 0, 3: 0}};
      if (type === 'dashboard') {
        data.tests = [...data.tests, ...newData]; 
      } else if (type === 'review') {
        
        Object.keys(newData).forEach(key => data.mistakes[key] += newData[key]);
      }
      chrome.storage.sync.set({satData: data}, () => {
        loadAndDisplayData();
        alert('Data updated!');
      });
    });
  }
});


function scanDashboard() {
  const tests = [];
  document.querySelectorAll('.test-card').forEach(card => { 
    const name = card.querySelector('.test-name')?.innerText;
    const module1Score = card.querySelector('.module1-score')?.innerText; 
    const module2Score = card.querySelector('.module2-score')?.innerText;
    if (module1Score && name.includes('Completed')) { 
      const mistakes1 = 27 - parseInt(module1Score.split('/')[0]);
      const mistakes2 = 27 - parseInt(module2Score.split('/')[0]);
      tests.push({name, totalMistakes: mistakes1 + mistakes2});
    }
  });
  return tests;
}

function scanReview() {
  const mistakes = {0: 0, 1: 0, 2: 0, 3: 0}; 
  // 0 = Information and Ideas
  // 1 = Craft and Structure  
  // 2 = Expression of Ideas
  // 3 = Standard English Conventions

  
  let wrongNumbers = [];
  const wrongMarkerElements = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.trim().match(/^×\s*\d+/) 
  );
  
  if (wrongMarkerElements) {
    const match = wrongMarkerElements.textContent.trim().match(/×\s*([\d,\s]+)/);
    if (match) {
      wrongNumbers = match[1]
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));
    }
  }

  
  if (wrongNumbers.length === 0) {
    document.querySelectorAll('table tbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 4) {
        const userAns = cells[2]?.textContent?.trim();
        const correctAns = cells[3]?.textContent?.trim();
        const qNumText = cells[0]?.textContent?.trim();
        const qNum = parseInt(qNumText);
        if (!isNaN(qNum) && userAns && correctAns && userAns !== correctAns && userAns !== '') {
          wrongNumbers.push(qNum);
        }
      }
    });
  }

  if (wrongNumbers.length === 0) {
    console.log("No wrong questions detected");
    return mistakes;
  }

  
  const rows = document.querySelectorAll('table tbody tr');
  rows.forEach(row => {
    const numCell = row.querySelector('td:first-child');
    if (!numCell) return;
    
    const qNum = parseInt(numCell.textContent.trim());
    if (!wrongNumbers.includes(qNum)) return;

    const questionCell = row.querySelector('td:nth-child(2)');
    if (!questionCell) return;
    
    const qText = questionCell.textContent.toLowerCase().trim();

    let category = -1;

    // Standard English Conventions
    if (qText.includes('conforms to the conventions of standard english')) {
      category = 3;
    }
    // Expression of Ideas
    else if (
      qText.includes('most logical transition') ||
      qText.includes('effectively accomplishes this goal') ||
      qText.includes('accomplishes this goal') ||
      qText.includes('using relevant information from the notes') ||
      qText.includes('from the notes')
    ) {
      category = 2;
    }
    // Craft and Structure
    else if (
      qText.includes('most precise word') ||
      qText.includes('most precise phrase') ||
      qText.includes('as used in the text') ||
      qText.includes('function of the underlined') ||
      qText.includes('function of the portion') ||
      qText.includes('overall structure') ||
      qText.includes('best describes the function of') ||
      qText.includes('how would the author of text 2') ||
      qText.includes('based on the texts')
    ) {
      category = 1;
    }
    // Information and Ideas
    else if (
      qText.includes('best states the main idea') ||
      qText.includes('according to the text') ||
      qText.includes('illustrates the claim') ||
      qText.includes('supports the') ||
      qText.includes('directly support') ||
      qText.includes('best describes data from the') ||
      qText.includes('most logically completes the text')
    ) {
      category = 0;
    }
    
    else {
      if (qNum <= 8) {
        category = 1; // Craft & Structure ()
      } else if (qNum <= 14) {
        category = 0; // Information & Ideas
      } else if (qNum <= 22) {
        category = 3; // Standard English Conventions
      } else {
        category = 2; // Expression of Ideas ()
      }
    }

    if (category >= 0) {
      mistakes[category]++;
    }
  });

  console.log(`Categorized ${wrongNumbers.length} wrong questions:`, mistakes);
  return mistakes;
}