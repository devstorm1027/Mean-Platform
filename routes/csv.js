const router   = require("express").Router();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/csv' })
const fs = require('fs');
const parse = require('csv-parse');
const models = require("../models");

router.post("/", upload.single('csv'), function(req, res, next) {
    var data = [];
    var index = 0;
    var id = null;
    var hasBranch = false;
    var dataRecord = {};
    
    fs.createReadStream(req.file.path)
        .pipe(parse({delimiter: ','}))
        .on('data', function(record) {
            
            if(index != 0){

                // TODO: check if is the last record
                if((record[17] == 0 && hasBranch || record[17] == 0 && !hasBranch) && index !=1) {
                    var q = models.Business.createBusiness(dataRecord);
                    data.push({status:q, data:dataRecord});
                    hasBranch = false;
                }
                
                if (record[17] == 0 && !hasBranch){
                    dataRecord = {
                        name: {
                            english: record[0],
                            arabic: record[1]
                        },
                        description: {
                            english: record[0],
                            arabic: record[3]
                        },
                        website: record[4],
                        branches: [{
                            phoneNumber: record[5].trim(),
                            email: record[6],
                            address: {
                                english: record[7],
                                arabic: record[8]
                            },
                            location: {
                                latitude: record[9], 
                                longitude: record[10],
                                city: record[11]
                            },
                            openingHours: {
                                english: record[12],
                                arabic: record[13]
                            }
                        }], 
                        socialMedias: [{
                            type: "Twitter",
                            url: record[14]
                        },
                        {
                            type: "Facebook",
                            url: record[15]
                        },
                        {
                            type: "Instagram",
                            url: record[16]
                        }
                        ],
                        
                        photos: [

                        ]
                    };
                    if (record[18] != '') {
                        dataRecord.cover = {"filename": record[18]}
                    }
                    if (record[19] != '') {
                        dataRecord.photos.push({ "filename": record[19]})
                    }
                    if (record[20] != '') {
                        dataRecord.photos.push({ "filename": record[20]})
                    }
                    if (record[21] != '') {
                        dataRecord.photos.push({ "filename": record[21]})
                    }
                    if (record[22] != '') {
                        dataRecord.photos.push({ "filename": record[22]})
                    }
                }
                else {
                    var branch = {
                        phoneNumber: record[5].trim(),
                        email: record[6],
                        address: {
                            english: record[7],
                            arabic: record[8]
                        },
                        location: {
                            latitude: record[9], 
                            longitude: record[10],
                            city: record[11]
                        },
                        openingHours: {
                            english: record[12],
                            arabic: record[13]
                        }
                    }
                    dataRecord.branches.push(branch);
                    
                    hasBranch = true;
                }
                
                
  
            }
            index++;
        })
        .on('end',function() {
            res.send(data);
        });
});

module.exports = router;