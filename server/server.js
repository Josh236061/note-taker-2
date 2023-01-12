const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");
const Note = require("./Note");
const PORT = 3500;
var data = [];

// instantiate the express object
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

function readJsonDb(path) {
  var _data = [];
  fs.readFile(path, "utf8", (err, jsonString) => {
    if (err) {
      console.log("Error reading file", err);
      _data = [
        {
          title: "Error",
          text: err,
        },
      ];
    } else {
      try {
        data = JSON.parse(jsonString);
        _data = [_data, ...data];
      } catch (err) {
        console.log("Error parsing JSON string:", err);
        _data = [
          {
            title: "Error",
            text: err,
          },
        ];
      }
    }
  });

  return _data;
}

function writeToJsonDb(path, data) {
  const jsonString = JSON.stringify(data);
  fs.writeFile(path, jsonString, (err) => {
    if (err) {
      return "Error writing file " + err;
    } else {
      return "Success";
    }
  });
}

// retrieve all notes
app.get("/api/notes", (req, res) => {
  readJsonDb("db/db.json");
  res.send(data);
});

// save new notes
app.post("/api/notes", async (req, res) => {
  readJsonDb("db/db.json");
  const newNote = {
    id: crypto.randomUUID(),
    title: req.body.title,
    text: req.body.text,
  };

  // add to the array
  data.push(newNote);

  writeToJsonDb("db/db.json", data);

  res.send(`Note added successfully`);
});

app.delete("/api/notes/:id", (req, res) => {
  const id = req.params.id;
  const newData = data.filter((note) => note.id !== id);

  console.log(newData);

  writeToJsonDb("db/db.json", newData);

  res.send("Note deleted successfully");
});

// start the express server
app.listen(PORT, () => {
  console.log(`Server started on Port ${PORT}`);
});
