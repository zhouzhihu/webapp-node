'use strict';

let wilddog = require("wilddog");

var util = require('util');

let wilddogApp = wilddog.initializeApp({
  authDomain : 'web-app.wilddogio.com',
  syncURL : 'https://web-app.wilddogio.com/addressList'
});

function getALByType(req, res) {
  let type = req.swagger.params.type.value;
  wilddogApp.sync().once("value", snapshot => {
    let values = [];
    if("all" == type)
      values = snapshot.val()
    else{
      let newValues = []
      snapshot.forEach(snap => {
        snap.val().favorite ? newValues.push(snap.val()) : ""
      })
      values = newValues
    }
    res.json(values)
  })
}

function addAddressList(req, res) {
  let addressList = req.swagger.params.addressList.value;
  console.log(addressList)
  res.json("保存成功！")
}

function getAddressList(req, res) {
  let id = req.swagger.params.id.value;
  getAllAddressList().then(snapshot =>{
    let key = -1
    snapshot.forEach(snap => {
      id == snap.val().id ? key = snap.key() : -1
    })
    return key
  }).then(key => {
    wilddogApp.sync().child(key).once("value", snapshot => {
      res.json(snapshot.val())
    });
  })
}

function toggleFavorite(req, res) {
  let addressList = req.swagger.params.addressList.value;
  let id = addressList.id;
  getAllAddressList().then(snapshot =>{
    let key = -1
    snapshot.forEach(snap => {
      id == snap.val().id ? key = snap.key() : -1
    })
    return key
  }).then(key => {
    if(-1 == key)
        res.json("更新失败")
    else {
      wilddogApp.sync().child(key).once("value", snapshot => {
        wilddogApp.sync().child(key).update({"favorite": !snapshot.val().favorite});
        var result = {message: '更新成功'};
        res.json('更新成功')
      })
    }
  })
}
function getAllAddressList(){
  return new Promise((resolve, reject) => {
    wilddogApp.sync().once("value", snapshot =>{
      resolve(snapshot);
    }, reject)
  })
}

module.exports = {
  getALByType: getALByType,
  toggleFavorite: toggleFavorite,
  addAddressList: addAddressList,
  getAddressList: getAddressList
};
