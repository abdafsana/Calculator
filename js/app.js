const box = document.querySelectorAll('.conventor');
box.forEach(item => {
    item.addEventListener('click', () => {
        box.forEach(b => b.classList.remove('active'));
        item.classList.add('active');
    });
});

