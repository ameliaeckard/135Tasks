const limits = {
    large: 1,
    medium: 3,
    small: 5
  };
  
  function updateProgress() {
    const checkboxes = document.querySelectorAll('.task-list input[type="checkbox"]');
    const completed = Array.from(checkboxes).filter(c => c.checked).length;
    const percent = (completed / 9) * 100;
    document.getElementById('progress-bar').style.width = `${percent}%`;
  
    if (completed === 9) {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#f1642e', '#a3b565', '#504e76', '#c4c3e3']
      });
      alert("Day Conquered! 🦮 You're unstoppable!");
    }
  }
  
  ['large', 'medium', 'small'].forEach(category => {
    const input = document.getElementById(`${category}-input`);
    const list = document.getElementById(`${category}-list`);
  
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && input.value.trim() !== '') {
        if (list.children.length >= limits[category]) {
          alert(`Only ${limits[category]} task(s) allowed in ${category}`);
          return;
        }
  
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
  
        const span = document.createElement('span');
        span.textContent = input.value;
  
        // Editable text on click
        span.addEventListener('click', () => {
          const inputEdit = document.createElement('input');
          inputEdit.type = 'text';
          inputEdit.value = span.textContent;
          inputEdit.style.flex = '1';
          li.replaceChild(inputEdit, span);
          inputEdit.focus();
  
          inputEdit.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && inputEdit.value.trim() !== '') {
              span.textContent = inputEdit.value;
              li.replaceChild(span, inputEdit);
            }
          });
  
          inputEdit.addEventListener('blur', () => {
            li.replaceChild(span, inputEdit);
          });
        });
  
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✖';
        deleteBtn.style.marginLeft = 'auto';
        deleteBtn.style.background = 'none';
        deleteBtn.style.border = 'none';
        deleteBtn.style.color = '#f1642e';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontSize = '16px';
        deleteBtn.addEventListener('click', () => {
          li.remove();
          updateProgress();
        });
  
        checkbox.addEventListener('change', () => {
          span.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
          if (checkbox.checked) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
          updateProgress();
        });
  
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
        input.value = '';
        input.focus();
      }
    });
  });
  
  // Reset button
  document.getElementById('reset-button').addEventListener('click', () => {
    ['large-list', 'medium-list', 'small-list'].forEach(id => {
      document.getElementById(id).innerHTML = '';
    });
    ['large-input', 'medium-input', 'small-input'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('progress-bar').style.width = '0%';
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  });
  
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
  
  // Autofocus on load
  window.onload = () => {
    document.getElementById('large-input').focus();
  };