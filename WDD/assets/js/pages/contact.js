const nameInput = document.getElementById('contactName');
const emailInput = document.getElementById('contactEmail');
const messageInput = document.getElementById('contactMessage');
const sendBtn = document.getElementById('sendMessageBtn');

sendBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !email || !message) {
    alert('Please fill your name, email, and message.');
    return;
  }
  if (!validEmail) {
    alert('Please enter a valid email address.');
    return;
  }

  try {
    const res = await fetch('../backend/api.php?action=contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to send');

    alert('Thanks! Your message has been sent successfully.');
    nameInput.value = '';
    emailInput.value = '';
    messageInput.value = '';
  } catch (err) {
    alert('Server unavailable. Message was not saved. Please try again.');
  }
});
