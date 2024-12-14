const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

const dotenv = require("dotenv");
dotenv.config();
// import { GoogleGenerativeAI } from "@google/generative-ai";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const app = express();
const port = 3007;

let history = [];

const findHistory = (id) => {
    for (let i = 0; i < history.length; i++) {
        let h = history[i];
        if (h.plate_number == id) {
            return h;
        }
    }
    return null;
};

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

const tryJSON = (input) => {
    try {
        return JSON.parse(input);
    } catch (e) {
        return false;
    }
};

const parse = (input) => {
    let output = [];
    let chunks = input.split(/([{}])/);

    for (let i = 0; i < chunks.length; i++) {
        if (chunks[i] === "{") {
            // found some possible JSON; start at the last } and backtrack until it works.
            for (let j = chunks.lastIndexOf("}"); j > i; j--) {
                if (chunks[j] === "}") {
                    // Does it blend?
                    let parsed = tryJSON(chunks.slice(i, j + 1).join(""));
                    if (parsed) {
                        // it does! Grab the whole thing and skip ahead
                        output.push(parsed);
                        i = j;
                    }
                }
            }
        } else if (chunks[i]) {
            // neither JSON nor empty
            output.push(chunks[i]);
        }
    }

    // console.log(output);
    return output;
};

// CORS middleware
app.use(cors());

// Serve static files (images)
app.use("/uploads", express.static("uploads"));

// Upload endpoint
app.post("/upload", upload.single("image"), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // let model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let prompt = `If this image contains a plate number, read the plate number of the image. 
        Remember the vehicle, if this vehicle is not in your memory, output a json string with this example {"plate_number": "B 1308 FFK", "vehicle": "car", "color": "black"}, 
        if this vehicle is in your memory, return a message saying this vehicle has been read before. 
        Otherwise, return a message saying there is no plate number detected.`;

    // let im = fs.readFileSync(file.path);
    // // convert binary data to base64 encoded string
    // let b = new Buffer(im).toString("base64");

    let responseMsg = "File uploaded successfully";

    try {
        const image = {
            inlineData: {
                data: Buffer.from(fs.readFileSync(file.path)).toString("base64"),
                mimeType: "image/jpg",
            },
        };
        let response = await model.generateContent([prompt, image]);
        // console.log(response);
        // console.log(response.response.text());
        responseMsg = response.response.text();

        let foundArr = parse(responseMsg);

        for (let ob of foundArr) {
            if (typeof ob === "object") {
                let found = findHistory(ob.plate_number);
                if (!found) {
                    let newob = {
                        ...ob,
                        scanned_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                    };
                    history.push(newob);
                    responseMsg = `New vehicle scanned ${JSON.stringify(newob)}`;
                } else {
                    let index = history.indexOf(found);
                    if (index > -1) {
                        // only splice array when item is found
                        history.splice(index, 1); // 2nd parameter means remove one item only
                    }
                    responseMsg = `Scanned vehicle exiting ${JSON.stringify(found)}`;
                }
            }
        }

        // console.log(responseMsg, parse(responseMsg), typeof parse(responseMsg));
    } catch (err) {
        console.log(err);
        responseMsg = err.message;
    }

    res.json({ message: responseMsg, filename: file.filename });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
