var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var needle = require('needle');

server.listen(3000);
console.log(`Server running at http://localhost:3000/`);
app.get('/', function(req,res){
  res.sendFile(__dirname+'/index.html')
});
var windguruModel = 'all';
var spot = 87721;
var url = `http://micro.windguru.cz/?s=${spot}&m=${windguruModel}`;
io.on('connection',function(socket){
  console.log(`Connected`);

  socket.on('seek',function(dataseek){
    console.log(dataseek);
    needle.get(url, function(err, res){
      if (err) throw err;
      var txt =res.body;
      var str2 = txt.substring(txt.indexOf('Date'),txt.indexOf('WRF 9 km'));
      var vat=parse(str2,dataseek);
      socket.emit('get',vat)
  });
  });
});
function parse(text,ranget){
  var cont=text.split('\n');
 var temper;
  while(cont[0]!=''){
    cont.shift();
  }    cont.shift();
  var out="";
  var data= parseInt(cont[0].substr(5,4));
  var day=cont[0].substr(1,3);
  let arr =[];
  let arr1 =[];
  let arr2 =[];
  var counter2=0;
  var counter=0;
  var counter1=0;
  var c=0;
  while (c<2) {
    day=cont[0].substr(1,3);
    data= parseInt(cont[0].substr(5,4));
    switch(day){
      case "Mon":
        out+="В понедельник\n";
        break;
        case "Tue":
        out+="Во вторник\n";
        break;
        case "Wed":
        out+="В среду\n";
        break;
        case "Thu":
        out+="В четверг\n";
        break;
        case "Fri":
        out+="В пятницу\n";
        break;
        case "Sat":
        out+="В субботу\n";
        break;
        case "Sun":
        out+="В Воскресенье\n";
        break;
          };
          out = out + data + " числа<br>\n";
    while(cont[0]!=''){
      var temper=cont[0].substr(48,4);
      var time= parseInt(cont[0].substr(9,4));
      var speed= parseInt(cont[0].substr(12,10));
      var grad= parseInt(cont[0].substr(36,10));
    
  
    if(parseInt(temper)<parseInt(ranget[0]) || parseInt(temper)>parseInt(ranget[1])){
      arr[counter]=+time;counter++;
    }
    if(speed<parseInt(ranget[2]) || speed>parseInt(ranget[3])){
      arr1[counter1]=+time;counter1++;
    }
    if(grad<parseInt(ranget[4]) || grad>parseInt(ranget[5])){
      arr2[counter2]=+time;counter2++;
  
    }
      cont.shift();
    } 
    if(counter!=0){
      var temp=-1;
      var flag=0;
      var end=-1;
      console.log(arr);
        arr.forEach(function(element, index) {
          if(temp==-1){
            temp=element;
          }
          if(element-temp>=2&&flag==0){
            flag=1;
            end=index;
          }
          temp=element;
        });
        if(end!=-1){
      out=out+ `Температура находится в позволенном диапазоне от ${arr[0]} до ${arr[end]} часов
      <br>\n`;
        }else{
    out=out+ `Температура выходит за указанные рамки в диапазоне от ${arr[0]} до ${arr[counter-1]} часов<br>\n`;
   }
  }
  if(counter1!=0){
    var temp=-1;
    var flag=0;
    var end=-1;
    console.log(arr1);
      arr1.forEach(function(element, index) {
        if(temp==-1){
          temp=element;
        }
        if(element-temp>=2&&flag==0){
          flag=1;
          end=index;
        }
        temp=element;
      });
      if(end!=-1){
    out=out+ `Скорость ветра находится в позволенном диапазоне от ${arr1[0]} до ${arr1[end]} часов
    <br>\n`;
      }else{
        out=out+ `Скорость ветра выходит за указанные рамки в диапазоне от ${arr1[0]} до ${arr1[counter1-1]} часов<br>\n`;}
 }
 if(counter2!=0){
  var temp=-1;
  var flag=0;
  var end=-1;
  console.log(arr2);
    arr2.forEach(function(element, index) {
      if(temp==-1){
        temp=element;
      }
      if(element-temp>=2&&flag==0){
        flag=1;
        end=index;
      }
      temp=element;
    });
    if(end!=-1){
  out=out+ `Направление ветра находится в позволенном диапазоне от ${arr2[0]} до ${arr2[end]} часов
  <br>\n`;
    }else{
      out=out+ `Направление ветра выходит за указанные рамки в диапазоне от ${arr2[0]} до ${arr2[counter2-1]} часов<br>\n`;
    }
}
     

       

    c++;    
    cont.shift();
    arr =[];
    arr1 =[];
    arr2 =[];
    counter2=0;
    counter=0;
    counter1=0;
  }
  
  return out;
  }