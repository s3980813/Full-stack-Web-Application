let creditCard = document.getElementById('CreditCard'),
    eWallet = document.getElementById('E-wallet'),
    Paypal = document.getElementById('Paypal'),
    cardDetails = document.querySelector('.PaymentMethods form');

function pay_by_Card() {
    cardDetails.style.display = 'block'
}

function pay_by_E_wallet() {
    cardDetails.style.display = 'none'
}

function pay_by_Paypal() {
    cardDetails.style.display = 'none'
}

function goBack() {
    window.history.back()
}

function redirect() {
    window.location.assign("thankyou.ejs")
    alert("Thank you for your order")
}