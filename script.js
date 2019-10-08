class Api {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.token = options.headers.authorization;   

    /**
     * Можно улучшить
     * 
     * Ключи удобно получать для коротких переменных
     * constructor({ baseUrl, headers: { authorization } }) { this.token = this.authorization}
     * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#%D0%A0%D0%B0%D0%B7%D0%B1%D0%BE%D1%80_%D0%BE%D0%B1%D1%8A%D0%B5%D0%BA%D1%82%D0%BE%D0%B2
      */ 
  }

  getUser(){
    return fetch(`${this.baseUrl}/users/me`, {
      headers: {
        authorization: this.token
      }
    })

    .then((res) => {
      if (res.ok) {
        return res.json();        
      } 
      return Promise.reject(`Ошибка: ${res.status}`);
    })
    
    .catch((err) => {
      console.log('Ошибка. Запрос не выполнен. Код ошибки:', err);      
    });
  }

  getInitialCards() {
    return fetch(`${this.baseUrl}/cards`, {
      headers: {
        authorization: this.token
      }
    })
 
    .then((res) => {
      if (res.ok) {
        return res.json();        
      }      
      return Promise.reject(`Ошибка: ${res.status}`);
    })

    .catch((err) => {
      console.log('Ошибка. Запрос не выполнен. Код ошибки:', err);
    });
  }

  editUserOnServer(){
    return fetch(`${this.baseUrl}/users/me`, {
      method: 'PATCH',
      headers: {
        authorization:  this.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      name: document.forms.userInfoEdit.userName.value,
      about: document.forms.userInfoEdit.userJob.value
      }) // Можно улучшить
      // вместо селекторов лучше передавать параметры в метод
      // это позволит не привязывать классы к конкретной разметке
    })

    .then((res) => {
      if (res.ok) {
        return res.json();        
      }
      return Promise.reject(`Ошибка: ${res.status}`);
    })
    
    .catch((err) => {
      console.log('Ошибка. Запрос не выполнен. Код ошибки:', err);      
    });
  }  
}

const api = new Api({
  baseUrl: 'http://95.216.175.5/cohort3',
  headers: {
    authorization: 'c79ba222-ea08-4c5f-913f-ef9b73e1970f',
    'Content-Type': 'application/json'
  }
});


api.getUser().then(data => { // Можно улучшить ({ name, about })
  if (data.name && data.about)  {
    document.querySelector('.user-info__name').textContent = data.name;
    document.querySelector('.user-info__job').textContent = data.about;
    document.querySelector('.user-info__photo').style.backgroundImage = `url(${data.avatar})`;
  }
});


api.getInitialCards().then(cards => {
  /**
   * Можно улучшить
   * 
   * Чтобы избежать ошибок при пустом массиве стоит проверять количество
   * элементов в массиве cards && cards.length > 0
   */
  new CardList(document.querySelector('.places-list'), cards, buttonAddCard);
});



const formUserInfo = document.forms.userInfoEdit;
formUserInfo.addEventListener('submit', function(event){
  event.preventDefault();
  api.editUserOnServer().then(user => {                 
    if (user.name && user.about) {
      document.querySelector('.user-info__name').textContent = user.name;
      document.querySelector('.user-info__job').textContent = user.about;
      document.querySelector('#userInfoEdit').classList.remove('popup_is-opened');
    }      
  });         
});


// **** КЛАССЫ ****

class Card {
  constructor(name, link) {
    this.placeName = name;
    this.placeLink = link;    
    this.cardItem = this.create(name, link);
    /**
     * Можно улучшить name и link записаны в поля класса
     * можно не передавать повторно, а использовать в методах поля класса
     */
    
    this.like = this.like.bind(this);
    this.remove = this.remove.bind(this);


    this.cardItem
      .querySelector('.place-card__delete-icon')
      .addEventListener('click', this.remove);
    this.cardItem
      .querySelector('.place-card__like-icon')
      .addEventListener('click', this.like); 
  }

  like() {
    this.like = !this.like; 
    this.cardItem.querySelector('.place-card__like-icon').classList.toggle('place-card__like-icon_liked')
  }

  remove() {
    this.cardItem.parentNode.removeChild(this.cardItem);
  }

  create(name, link) {
    const cardItem = document.createElement('div');
    cardItem.className = 'place-card';
    
    const cardImage = document.createElement('div'); //иллюстрация карточки
    cardImage.className = 'place-card__image';
    cardImage.style.backgroundImage = 'url(' + link + ')';
    cardItem.appendChild(cardImage);

    /* Можно лучше: лучше вынести обработчкик открытия попапа в отдельный метод, также как
    это сделано для remove и like */
    cardImage.addEventListener('click', function(event){
      if (!event.target.classList.contains('place-card__delete-icon')) {
        const popupimg = new PopupImage(document.querySelector('#increaseImage'));
        popupimg.popupimage(cardImage.style.backgroundImage);
      } 
    })
    
    const cardDeleteIcon = document.createElement('button');//кнопка удаления карточки
    cardDeleteIcon.className = 'place-card__delete-icon';
    cardImage.appendChild(cardDeleteIcon);
    
    const cardDescription = document.createElement('div');//описание карточки
    cardDescription.className = 'place-card__description';
    cardItem.appendChild(cardDescription);
    
    const cardName = document.createElement('h3'); //имя карточки
    cardName.className = 'place-card__name';
    cardName.textContent = name;
    cardDescription.appendChild(cardName);
    
    const cardLikeIcon = document.createElement('button');//кнопка лайка карточки
    cardLikeIcon.className = 'place-card__like-icon';
    cardDescription.appendChild(cardLikeIcon);

    return cardItem;
  }
}

class CardList {
  constructor(container, initialCards, button) {
    this.container = container;
    this.initialCards = initialCards;
    this.buttonAddCard = button;
    this.buttonAddCard.addEventListener('click', function(){
      document.querySelector('#cardmaker').classList.add('popup_is-opened')
    });

    /* Можно лучше: добавление карточки делать по submit формы, а не по клику на кнопку */
    const buttonSaveCard = document.querySelector('#saveCardButton'); //кнопка добавить карточки

    this.addcard = this.addcard.bind(this);
    buttonSaveCard.addEventListener('click', this.addcard);

    this.render();
  }

  addcard(event) {
    event.preventDefault();
    const name = formNewCard.elements.placeName.value;
    const link = formNewCard.elements.placeLink.value;
    const newcard = new Card(name, link);
    this.container.append(newcard.cardItem);
    document.querySelector('#cardmaker').classList.remove('popup_is-opened'); 
  }

  render() {
    this.initialCards.forEach( (item) => { // Можно улучшить
      // Вместо промежуточных переменных проще разбирать входящий объект
      // .forEach(({ name, link }))
      const name = item.name;
      const link = item.link;      
      const {cardItem} = new Card(name, link);
      this.container.appendChild(cardItem);
    })
  }
}

class Popup {
  constructor(popupElem, button){
    this.popupElem = popupElem;    
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.popupElem
      .closest('.popup').querySelector('.popup__close')
      .addEventListener('click', this.close);
    
    if (button) { // если передаём попап, который открывается при нажатии кнопки
      this.button = button;

      this.button
        .addEventListener('click', this.open);
    }    
  }

  open() {
    console.log('open');
    this.popupElem.classList.add('popup_is-opened');
  }

  close(){
    this.popupElem.closest('.popup').classList.remove('popup_is-opened');
  }
 }

class PopupImage extends Popup {
  constructor(popupElem) {
    super(popupElem);
    /* Можно лучше: обработчик на document.querySelector('.place-card__image') не нужно вешать здесь,
    попап открывается по клику на картинку карточки, это описано в классе  Card */
    document.querySelector('.place-card__image').addEventListener('click', this.popupimage);
    const popupIncreaseImage = document.querySelector('#increaseImage');
    this.popupIncreaseImage = popupIncreaseImage;
  }

  // функция создания и показа попапа при нажатии на картинку
  popupimage(link) {
    const popupIncreaseImage = document.querySelector('#increaseImage');
    this.popupIncreaseImage = popupIncreaseImage;
    this.popupIncreaseImage.firstElementChild.style.backgroundImage = link;
    this.popupIncreaseImage.firstElementChild.style.backgroundSize = 'cover';
    this.popupIncreaseImage.firstElementChild.style.backgroundRepeat = 'no-repeat';  
    this.popupIncreaseImage.firstElementChild.style.maxWidth = '80vw';
    this.popupIncreaseImage.firstElementChild.style.maxHeight = '80vh';
    this.popupIncreaseImage.classList.add('place-card__image-popup');  
    this.popupIncreaseImage.classList.add('popup_is-opened');
  }

  close(){
    this.popupIncreaseImage.classList.remove('place-card__image-popup');
    this.popupIncreaseImage.classList.remove('popup_is-opened');  
  }
}

class PopupWithValidation extends Popup {
  constructor(popupElem, button){
    super(popupElem, button);
  }

  open() {
    //случай открытия формы редактирования инфо о пользователе Edit

    /* Можно лучше: есть условная проверка где произошел клик - можно было просто сделать два разных
    класса для каждого типа попапа, а не проверять какой класс у кнопки  */
    if (this.button.classList.contains('user-info__editButton')) {
      this.popupElem.classList.add('popup_is-opened');

      const formUserInfo = document.forms.userInfoEdit;
      formUserInfo.userName.value = document.querySelector('.user-info__name').textContent;
      formUserInfo.userJob.value = document.querySelector('.user-info__job').textContent;

      document.querySelector(`.popup__input_userName`).classList.remove('popup__invalid');  
      document.querySelector(`.popup__input_userJob`).classList.remove('popup__invalid');  
      document.getElementById(`error-userName`).textContent = '';
      document.getElementById(`error-userJob`).textContent = '';

      /* Можно лучше: здесь и далее не нужно навешивать обработчики при кадом открытии попапа, лучше 
      делать это один раз в конструкторе */
            
      formUserInfo.addEventListener('input', function(event){  
        event.preventDefault();
        handleValidate(event);
      })

      //функция обновления имени/работы пользователя
      // function renameUser(name, job){
      //   document.querySelector('.user-info__name').textContent = name;
      //   document.querySelector('.user-info__job').textContent = job;
      // }
    }  

    //случай открытия формы добавления нового места
    if (this.button.id === "newCardButton") {
      //валидация на ввод в форму нового места
      formNewCard.addEventListener('input', function(event){
        event.preventDefault();
        handleValidate(event);
      })
    }      
  } 
}

// ***** Валидация *****

function handleValidate(event) {    
  resetError(event.target);
  validate(event.target);
}

function validate(element) {
  const errorElement = document.querySelector(`#error-${element.name}`);
  if ( !(element.parentNode.elements[0].checkValidity()) || !(element.parentNode.elements[1].checkValidity()) ) {    
    if (element.validity.valueMissing) {
      errorElement.textContent = 'Это обязательное поле';
    } else if (element.validity.tooLong || element.validity.tooShort){
      errorElement.textContent = 'Должно быть от 2 до 30 символов';
    } else {
      errorElement.textContent = element.validationMessage;      
    }
    
    element.parentElement.querySelector('.popup__button').classList.remove('activate-button');    
    element.parentElement.querySelector('.popup__button').setAttribute("disabled", "disabled");
    activateError(errorElement);

  } else if (!(element.parentNode.elements[0].checkValidity())) {
    activateError(errorElement);
  } else if (!(element.parentNode.elements[1].checkValidity())) {
    activateError(errorElement);
  } else {
    element.parentElement.querySelector('.popup__button').classList.add('activate-button');
    element.parentElement.querySelector('.popup__button').removeAttribute("disabled");
  }
}

function activateError(element) {
  element.parentNode.querySelector(`.popup__input_${element.id.slice(6,)}`).classList.add('popup__invalid');
}

function resetError (element) {
  element.parentNode.querySelector(`.popup__input_${element.name}`).classList.remove('popup__invalid');  
  document.getElementById(`error-${element.name}`).textContent = '';
}



//формы
const formNewCard = document.forms.newCard;
const placeName =  formNewCard.elements[0];
const placeLink = formNewCard.elements[1];
const placeSubmit = formNewCard.elements[2];
// const formUserInfo = document.forms.userInfoEdit;


// ********** СОЗДАНИЕ ОБЪЕКТОВ ***********
const cardmaker = document.querySelector('#cardmaker'); //попап с формой добавления карточки
const buttonAddCard = document.querySelector('#newCardButton'); //кнопка - для открытия попапа добавления карточки
const popupCardmaker = new PopupWithValidation(cardmaker, buttonAddCard);

const userEdit = document.querySelector('#userInfoEdit'); //попап с формой редактирования Имени/Работы юзера
const buttonUserEdit = document.querySelector('.user-info__editButton'); //кнопка Edit для открытия попапа формы редактирования
const popupUserEdit = new PopupWithValidation(userEdit, buttonUserEdit);

const placesList = document.querySelector('.places-list');
// const cardList = new CardList(document.querySelector('.places-list'), initialCards, buttonAddCard);
// const popupimg = new PopupImage(document.querySelector('#increaseImage'));





/**
 * Работа по обмену с данными выполнена хорошо.
 * 
 * Обратите внимание на возможности по получению переменных из ключей объекта
 * это позволит сократить дополнительные переменные и количество кода
 */







// **** ПРОШЛЫЕ КОММЕНТАРИИ РЕВЬЮЕРОВ ****
/*
  Хорошая работа. Отлично, что для попапа редактирования профиля и попапа изображения используется наследование.
  Но в некоторых местах в классах есть доступ к глобальным переменным. В иделе такого быть не должно,
  класс должен как можно меньше зависеть от окружения в котором работает и все ссылки на внешнее
  окружение должны передаваться через парамтеры контруктора и методом.

  Так, что давайте по крайней мере избавимся от обращения к списку карточек через
  document.querySelector('.places-list') в классах Card  и CardList. В этом поможет привязка
  контектса методов которые обрабатывают события к контексту класса.
*/

/*
  Необходимые замечания исправлены верно. Добавил ещё несколько замечаний по организации классов попапов.
  В классе PopupWithValidation обработчики навешиваются на элементы при каждом открытии попапа, этого делать не нужно,
  лучше перенести настройку обработчиков в конструктор, чтобы она выполнялась один раз.

  Если будет свободное время полезно будет ознакомиться с принципами SOLID 
  применяемые для проектирования ООП программ https://ota-solid.now.sh/ ,
  а если уж совсем захотите погрузиться в то, как правильно проектировать
  программы, можете почитать про паттерны проектирования, вот неплохое 
  руководство https://refactoring.guru/ru/design-patterns и там же хорошо
  про рефакторинг https://refactoring.guru/ru/refactoring
  Также недавно вышла отличная статья про ООП и SOLID https://habr.com/ru/post/446816/
*/

/*
  Замечания с прошлого ревью исправлены, но есть ещё одна проблема, на которую я к сожаленияю
  не указал в прошлый раз: при вводе в поля формы редактирования профиля текста длиннее 30 символов
  ошибки не отображаются, а кнопка не становится неактивной.

  Все ещё есть проблемы с версткой, которые лучше исправить:
  - неправильное расположение кнопки открытия попапа добавления карточки
  - попап с картинкой должен открываться на весь экран по центру
*/

/* Отлично, что код валидации формы переиспользуется
Надо исправить: при открытии попапа редактирования профиля необходимо очищать ошибки

Также есть замечания по верстке:
Перехала кнопка добавления новой карточки, чтобы она встала на место нужно её 
вынести из контейнера user-info__data
  <div class="user-info__data">
    <h1 class="user-info__name">Jaques Causteau</h1>
    <p class="user-info__job">Sailor, Researcher</p>
  </div>
  <button class="user-info__editButton">Edit</button> 

Так же не не центрируется попап с картинкой
Следует задавать max-width: 80vw и max-height: 80vh не попапу, а самому изображению.
*/


// function likeCard(){  
  //   const likeIcon = document.querySelectorAll('.place-card__like-icon');
  //   /*
  //   Можно лучше: можно использовать делегирование - повестить один обработчик на контейнер places-list
  //   и в обработчике проверяя на каком элементе произошел клик выполнять соответствующее действие.
  //   Проверить на каком элементе произошло событие можно с помощью проверки какой класс у event.target
  // */
  //   for (let i=0; i<likeIcon.length; i++) {
  //     likeIcon[i].addEventListener('click', function(){
  //       likeIcon[i].classList.toggle('place-card__like-icon_liked');
  //     });
  //   }
  // }

  // //удаление карточки
  // function deleteCard(){
  //   /* Здесь также можно использовать делегирование */
  //   const removeCard = document.querySelectorAll('.place-card__delete-icon');
  //   for (let i=0; i< removeCard.length; i++) {
  //     removeCard[i].addEventListener('click', function(){
  //       removeCard[i].parentElement.parentElement.parentElement.removeChild(removeCard[i].parentElement.parentElement);
  //     });  
  //   }
  // }

  //event.target.parentElement.parentElement.parentElement.removeChild(event.target.parentElement.parentElement);
  /* Можно лучше: parentElement.parentElement.parentElement - при чтении кода не очень понятно,
    также если в разметке появится дополнительный контейнер обертка такое решение 
    может перестать работать правильно
    Лучше обращаться к places-list через document.querySelector('.places-list')
    или через метод closest event.target.closest('.places-list')
    https://developer.mozilla.org/ru/docs/Web/API/Element/closest */

/*
  Теперь программа работает правильно, хорошая работа!
*/

