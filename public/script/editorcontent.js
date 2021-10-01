ClassicEditor
.create(document.querySelector('#editor'))
.catch(error => {
  console.error(error);
});

let subjectNum = '<%-subjectNum%>'
let chapterNum = '<%-chapterNum%>'
document.getElementById("myform").onsubmit = (e) => {

console.log(e.target)
let url = "http://localhost:3000/saveChapter/" + subjectNum + "," + chapterNum
let data = new URLSearchParams()

let userDocuments = document.querySelector('.ck-content').innerHTML
data.append("data", userDocuments)
fetch(url, {
  method: "post",
  body: data,

}).then(res => res.text())
  .then(result => {
    document.write(result)
  }).catch(err => console.log(err))

}