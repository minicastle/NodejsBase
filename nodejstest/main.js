var http = require('http');
var fs = require('fs');
var url = require('url');
let qs = require('querystring');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    let pathname = url.parse(_url,true).pathname;
    console.log(queryData); 

    function templateHTML(title,list,body,control){
      let contents = `
      <!doctype html>
      <html>
      <head>
        <title>WEB - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        ${body}
      </body>
      </html>
      `;
      return contents;
    }

    function templateList(filelist){
      let list = `<ul>`;
        for(let i = 0; i< filelist.length ; i++){
          list = list+`<li><a href = "/?id=${filelist[i]}">${filelist[i]}</a></li>`
        }
      list = list+`</ul>`;
      return list;
    }

    if(pathname === "/"){
      if(queryData.id=== undefined){
        fs.readdir('./data',function(err,filelist){
          let list = templateList(filelist);
          let title = "Welcome";
          let description = "Hello, Node.js";
          
          let template = templateHTML(title,list,`<h2>${title}</h2>${description}`,`
          <a href = "/create">create</a>`);
          response.writeHead(200);
          response.end(template);
        });
      }
      else{
        fs.readdir('./data',function(err,filelist){
          fs.readFile(`data/${queryData.id}`,'utf8',function(err,description){
            let list = templateList(filelist);
            let title = queryData.id;
            let template = templateHTML(title,list,`<h2>${title}</h2>${description}`,`
            <a href = "/create">create</a>
            <a href = "/update?id=${title}">update</a>
            <form action = "/delete_process" method = "post">
              <input type = "hidden" name = "id" value = "${title}">
              <input type = "submit" value = "delete">
            </form>`);
            response.writeHead(200);
            response.end(template);
          });
        });
      }
    }
    else if(pathname === "/create"){
      fs.readdir('./data',function(err,filelist){
        let list = templateList(filelist);
        let title = "WEB - CREATE";
        
        let template = templateHTML(title,list,`
        < action = "/create_process" method = "post">
        <p><input type = "text" name = "title" placeholder = "title"/></p>
        <p><textarea 
        type = "text" 
        name = "description" 
        placeholder = "description"></textarea></p>
        <p><input type = "submit"/></p>
        </>
        `);
        response.writeHead(200);
        response.end(template);
      });
    }
    else if(pathname === "/create_process"){
      let body = "";
      request.on('data',function(data){
        body += data;
      });
      request.on('end',function(){
        let post = qs.parse(body);
        let title = post.title;
        let description = post.description;
        fs.writeFile(`data/${title}`,description,"utf8",function(err){
          response.writeHead(302, {Location: `/?id=${title}`});``
          response.end("Success");
        })
        console.log(title,description);
      });
    }
    else if(pathname === "/update"){
      fs.readdir('./data',function(err,filelist){
        fs.readFile(`data/${queryData.id}`,'utf8',function(err,description){
          let list = templateList(filelist);
          let title = queryData.id;
          let template = templateHTML(title,list,
            `
            <form action = "/update_process" method = "post">
            <input type = "hidden" name = "id" placeholder="title" value = "${title}">
            <p><input type = "text" name = "title" placeholder = "title" value=${title}></p>
            <p><textarea 
            type = "text" 
            name = "description" 
            placeholder = "description">${description}</textarea></p>
            <p><input type = "submit"/></p>
            </form>
          `,
          `<a href = "/create">create</a>
          <a href = "/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(template);
        });
      });
    }
    else if(pathname === "/update_process"){
      let body = "";
      request.on('data',function(data){
        body += data;
      });
      request.on('end',function(){
        let post = qs.parse(body);
        let id = post.id;
        let title = post.title;
        let description = post.description;
        console.log(post);
        fs.rename(`data/${id}`,`data/${title}`,function(err){
          fs.writeFile(`data/${title}`,description,"utf8",function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end("Success");
          });
        });
      });
    }
    else if(pathname === "/delete_process"){
      let body = "";
      request.on('data',function(data){
        body += data;
      });
      request.on('end',function(){
        let post = qs.parse(body);
        let id = post.id;
        fs.unlink(`data/${id}`,function(){
          response.writeHead(302, {Location: `/`});
            response.end("Success");
        })
      });
    }
    else{
      response.writeHead(404);
      response.end('Not found');
    }    
  });
app.listen(3000);