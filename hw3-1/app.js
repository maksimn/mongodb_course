// Программа на Node.js, которая удалит минимальную отметку за домашнюю работу для каждого 
// студента
// Для этого надо выполнить оператор UPDATE, взяв массив scores для каждого документа, найти 
// минимальный, удалить его через Array.splice() и задать scores значение нового массива.
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/school', function(err, db) {
    if(err) throw err;

    var cursorClosed = false;
    var outstandingUpdates = 0;

    db.collection('students').find().each((err, doc) => {
        if (err) throw err;

        if (doc == null) {
            cursorClosed = true;
            return;
        }

        var scores = doc.scores;
        var minScore = Number.MAX_VALUE;
        var minScoreIndex = -1;
        scores.forEach((s, ind) => {
            if (s.score < minScore && s.type === 'homework') {
                minScore = s.score;
                minScoreIndex = ind;
            }
        });
        doc.scores.splice(minScoreIndex, 1);

        db.collection('students').update({'_id': doc['_id']}, doc, (err, updated) => {
            if (err) throw err;

            console.log('updated');

            outstandingUpdates--;

            if (cursorClosed && outstandingUpdates == 0) {
                db.close();
                return;
            }
        });

        outstandingUpdates++;
    });
});