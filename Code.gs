// serves the webapp page
function doGet() {
  return HtmlService
      .createTemplateFromFile('index')
      .evaluate()
      .setTitle('ACG Chinese Flashcards')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

// function used to combine the html, css, and javascript
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// function to check if all the cards have been seen once and return relevant statistics on current use
function checkNotDone(state){
  var sheet = SpreadsheetApp.openById('1GL_uZerRF6TSx3XLKxwEBhSNhPp7DdAcO1k7gc5NcuA').getSheetByName("ActiveList");
  var numCards = sheet.getMaxRows()-2;
  var unavailCards = 0;
  var usedCards = 0;
  var masteredCards = 0;

  if(state == "Reading"){
    unavailCards = sheet.getRange(1,4,1,1).getValue();
    usedCards = sheet.getRange(1,5,1,1).getValue();
    masteredCards = sheet.getRange(1,6,1,1).getValue();
  }
  if(state == "Writing"){
    unavailCards = sheet.getRange(1,7,1,1).getValue();
    usedCards = sheet.getRange(1,8,1,1).getValue();
    masteredCards = sheet.getRange(1,9,1,1).getValue();
  }

  if(unavailCards != numCards){
    return [true,numCards-unavailCards,usedCards,masteredCards];
  }
  else{
    return [false,0,usedCards,masteredCards];
  }
}

// function that grabs and returns a card from the database
function getCard(state){
  var sheet = SpreadsheetApp.openById('1GL_uZerRF6TSx3XLKxwEBhSNhPp7DdAcO1k7gc5NcuA').getSheetByName("ActiveList");
  var numCards = sheet.getMaxRows()-2;
  var vocabList = sheet.getRange(3,1,numCards,9).getValues();

  for(var i=0;i<vocabList.length;i++){
    vocabList[i][9] = i;
  }
  for(var j=vocabList.length-1;j>=0;j--){
    if(state == "Reading"){
      if(vocabList[j][3] == "Used" || (vocabList[j][4]-vocabList[j][5])>=3) {
        vocabList.splice(j,1);
      }
    }
    if(state == "Writing"){
      if(vocabList[j][6] == "Used" || (vocabList[j][7]-vocabList[j][8])>=3) {
        vocabList.splice(j,1);
      }
    }
  }
  var cardObj = [];

  var currentCard = Math.floor(Math.random()*(vocabList.length));

  cardObj[0] = vocabList[currentCard][9]+3;
  cardObj[1] = vocabList[currentCard][0];
  cardObj[2] = vocabList[currentCard][1];
  cardObj[3] = vocabList[currentCard][2];

  return cardObj;
}

// function for storing whether or not the card was correctly answered
function markCorr(state,currCard){
  var sheet = SpreadsheetApp.openById('1GL_uZerRF6TSx3XLKxwEBhSNhPp7DdAcO1k7gc5NcuA').getSheetByName("ActiveList");

  if(state == "Reading"){
    sheet.getRange(currCard,5,1,1).setValue(sheet.getRange(currCard,5,1,1).getValue()+1);
  }
  if(state == "Writing"){
    sheet.getRange(currCard,8,1,1).setValue(sheet.getRange(currCard,8,1,1).getValue()+1);
  }
  usedCard(state,currCard);
}

// function for storing whether or not the card was correctly answered
function markIncorr(state,currCard){
  var sheet = SpreadsheetApp.openById('1GL_uZerRF6TSx3XLKxwEBhSNhPp7DdAcO1k7gc5NcuA').getSheetByName("ActiveList");

  if(state == "Reading"){
    sheet.getRange(currCard,6,1,1).setValue(sheet.getRange(currCard,6,1,1).getValue()+1);
  }
  if(state == "Writing"){
    sheet.getRange(currCard,9,1,1).setValue(sheet.getRange(currCard,9,1,1).getValue()+1);
  }

  usedCard(state,currCard);
}

// function to mark a card that has been seen already
function usedCard(state,currCard){
  var sheet = SpreadsheetApp.openById('1GL_uZerRF6TSx3XLKxwEBhSNhPp7DdAcO1k7gc5NcuA').getSheetByName("ActiveList");

  if(state == "Reading"){
    sheet.getRange(currCard,4,1,1).setValue("Used");
  }
  if(state == "Writing"){
    sheet.getRange(currCard,7,1,1).setValue("Used");
  }
}

// function to "reshuffle" the cards and bring all seen cards immediately back into the rotation
function reset(){
  var sheet = SpreadsheetApp.openById('1GL_uZerRF6TSx3XLKxwEBhSNhPp7DdAcO1k7gc5NcuA').getSheetByName("ActiveList");
  var numCards = sheet.getMaxRows()-1;
  sheet.getRange(2,4,numCards,1).clearContent();
  sheet.getRange(2,7,numCards,1).clearContent();
}


/*
// deprecated UI Serivce implementation for reference
// this was the first implementation back in early 2014 before UI Service was deprecated in favor of HtmlService
// https://developers.google.com/apps-script/reference/ui/

function doGet() {
  var app = UiApp.createApplication();
  var layout = app.createGrid(5,4);

  var handlerRead = app.createServerHandler('actionRead').addCallbackElement(layout);
  var handlerWrite = app.createServerHandler('actionWrite').addCallbackElement(layout);
  var handlerShow = app.createServerHandler('actionShow').addCallbackElement(layout);
  var handlerNext = app.createServerHandler('actionNext').addCallbackElement(layout);
  var handlerCorrect = app.createServerHandler('actionCorrect').addCallbackElement(layout);
  var handlerIncorrect = app.createServerHandler('actionIncorrect').addCallbackElement(layout);
  var handlerReset = app.createServerHandler('actionReset').addCallbackElement(layout);


  layout.setWidget(0,0,app.createTextBox().setName('textboxType').setId('textboxType').setValue('Initialized').setVisible(false));
  layout.setWidget(0,1,app.createButton('Reading').setId('buttonRead').addClickHandler(handlerRead).setVisible(true));
  layout.setWidget(0,2,app.createButton('Writing').setId('buttonWrite').addClickHandler(handlerWrite).setVisible(true));
  layout.setWidget(0,3,app.createLabel().setId('labelType').setVisible(false));

  layout.setWidget(1,0,app.createLabel().setId('labelChar').setStyleAttribute('font-size','32px').setVisible(false));
  layout.setWidget(1,1,app.createLabel().setId('labelPinYin').setStyleAttribute('font-size','24px').setVisible(false));
  layout.setWidget(1,2,app.createLabel().setId('labelEnglish').setStyleAttribute('font-size','24px').setVisible(false));

  layout.setWidget(2,0,app.createTextBox().setName('textboxCurrCard').setId('textboxCurrCard').setValue('Initialized').setVisible(false));
  layout.setWidget(2,1,app.createButton('Show All').setId('buttonShow').addClickHandler(handlerShow).setVisible(false));
  layout.setWidget(2,2,app.createButton('Next').setId('buttonNext').addClickHandler(handlerNext).setVisible(false));

  layout.setWidget(3,1,app.createButton('Remembered').setId('buttonCorrect').addClickHandler(handlerCorrect).setVisible(false));
  layout.setWidget(3,2,app.createButton('Forgot').setId('buttonIncorrect').addClickHandler(handlerIncorrect).setVisible(false));

  layout.setWidget(4,2,app.createButton('ResetCards').setId('buttonReset').addClickHandler(handlerReset).setVisible(true));

  app.add(layout);
  return app;
}

function actionRead(e){
  var app = UiApp.getActiveApplication();

  app.getElementById('textboxType').setValue("Reading");
  app.getElementById('labelType').setText("Currently Testing Reading").setVisible(true);
  app.getElementById('buttonShow').setVisible(true);
  app.getElementById('buttonNext').setVisible(true);

  return app;
}

function actionWrite(e){
  var app = UiApp.getActiveApplication();

  app.getElementById('textboxType').setValue("Writing");
  app.getElementById('labelType').setText("Currently Testing Writing").setVisible(true);
  app.getElementById('buttonShow').setVisible(true);
  app.getElementById('buttonNext').setVisible(true);

  return app;
}

function actionShow(e){
  var app = UiApp.getActiveApplication();

  app.getElementById('labelChar').setVisible(true);
  app.getElementById('labelPinYin').setVisible(true);
  app.getElementById('labelEnglish').setVisible(true);

  app.getElementById('buttonCorrect').setVisible(true);
  app.getElementById('buttonIncorrect').setVisible(true);

  return app;
}

function actionNext(e){
  var app = UiApp.getActiveApplication();

  var sheet = SpreadsheetApp.openById('1GL_uZerRF6TSx3XLKxwEBhSNhPp7DdAcO1k7gc5NcuA').getSheetByName("ActiveList");
  var numCards = sheet.getMaxRows()-1;
  var vocabList = sheet.getRange(2,1,numCards,9).getValues();
  var type = e.parameter.textboxType;
  var UsedCards = 0;

  if(type == "Reading"){
    UsedCards = sheet.getRange(1,4,1,1).getValue();
  }
  if(type == "Writing"){
    UsedCards = sheet.getRange(1,7,1,1).getValue();
  }


  if(UsedCards != numCards){
    var currentCard = Math.floor(Math.random()*(numCards));

    if(type == "Reading"){
      while(vocabList[currentCard][3] == "Used" || (vocabList[currentCard][4]-vocabList[currentCard][5])>=3) {
        currentCard = Math.floor(Math.random()*(numCards-1));
      }
    }
    if(type == "Writing"){
      while(vocabList[currentCard][6] == "Used" || (vocabList[currentCard][7]-vocabList[currentCard][8])>=3) {
        currentCard = Math.floor(Math.random()*(numCards-1));
      }
    }
    app.getElementById('labelChar').setText(vocabList[currentCard][0]);
    app.getElementById('labelPinYin').setText(vocabList[currentCard][1]);
    app.getElementById('labelEnglish').setText(vocabList[currentCard][2]);
    app.getElementById('textboxCurrCard').setValue(currentCard+2);

    if(type == "Reading"){
      sheet.getRange(currentCard+2,4,1,1).setValue("Used");
      app.getElementById('labelChar').setVisible(true);
      app.getElementById('labelPinYin').setVisible(false);
      app.getElementById('labelEnglish').setVisible(false);

    }
    if(type == "Writing"){
      sheet.getRange(currentCard+2,7,1,1).setValue("Used");
      app.getElementById('labelChar').setVisible(false);
      app.getElementById('labelPinYin').setVisible(true);
      app.getElementById('labelEnglish').setVisible(true);
    }
  }
  else{
    app.getElementById('labelEnglish').setText("Cards all Used. Please Reset");
    app.getElementById('labelChar').setVisible(false);
    app.getElementById('labelPinYin').setVisible(false);
    app.getElementById('labelEnglish').setVisible(true);
  }
  app.getElementById('buttonCorrect').setVisible(false);
  app.getElementById('buttonIncorrect').setVisible(false);

  return app;
}

function actionCorrect(e){
  var app = UiApp.getActiveApplication();

  var sheet = SpreadsheetApp.openById('1GL_uZerRF6TSx3XLKxwEBhSNhPp7DdAcO1k7gc5NcuA').getSheetByName("ActiveList");

  var rowCard = e.parameter.textboxCurrCard;
  var type = e.parameter.textboxType;

  if(type == "Reading"){
    sheet.getRange(rowCard,5,1,1).setValue(sheet.getRange(rowCard,5,1,1).getValue()+1);
  }
  if(type == "Writing"){
    sheet.getRange(rowCard,8,1,1).setValue(sheet.getRange(rowCard,8,1,1).getValue()+1);
  }

  app.getElementById('buttonCorrect').setVisible(false);
  app.getElementById('buttonIncorrect').setVisible(false);

  return app;
}

function actionIncorrect(e){
  var app = UiApp.getActiveApplication();

  var sheet = SpreadsheetApp.openById('1GL_uZerRF6TSx3XLKxwEBhSNhPp7DdAcO1k7gc5NcuA').getSheetByName("ActiveList");

  var rowCard = e.parameter.textboxCurrCard;
  var type = e.parameter.textboxType;

  if(type == "Reading"){
    sheet.getRange(rowCard,6,1,1).setValue(sheet.getRange(rowCard,6,1,1).getValue()+1);
  }
  if(type == "Writing"){
    sheet.getRange(rowCard,9,1,1).setValue(sheet.getRange(rowCard,9,1,1).getValue()+1);
  }

  app.getElementById('buttonCorrect').setVisible(false);
  app.getElementById('buttonIncorrect').setVisible(false);

  return app;
}

function actionReset(e){
  var app = UiApp.getActiveApplication();

  var sheet = SpreadsheetApp.openById('1GL_uZerRF6TSx3XLKxwEBhSNhPp7DdAcO1k7gc5NcuA').getSheetByName("ActiveList");
  var numCards = sheet.getMaxRows()-1;
  sheet.getRange(2,4,numCards,1).clearContent();
  sheet.getRange(2,7,numCards,1).clearContent();

  app.getElementById('labelChar').setVisible(false);
  app.getElementById('labelPinYin').setVisible(false);
  app.getElementById('labelEnglish').setVisible(false);
  app.getElementById('buttonCorrect').setVisible(false);
  app.getElementById('buttonIncorrect').setVisible(false);

  return app;
}
*/
