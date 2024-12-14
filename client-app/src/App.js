import React, { useState } from "react";
import { Button, TextField, Box, Typography, CardMedia } from "@mui/material";
import LoadingSpinner from "./loading";

function App() {
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [imageCaption, setImageCaption] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = async (e) => {
        setIsLoading(true);
        setImageUrl("");
        setImageCaption("");
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("http://localhost:3007/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setImageUrl(`http://localhost:3007/uploads/${data.filename}`);
            setImageCaption(data.message);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <Typography variant="h4">Simple Parking</Typography>
            <input type="file" onChange={handleImageUpload} style={{ display: "none" }} id="fileInput" />
            <label htmlFor="fileInput">
                <Button variant="contained" component="span">
                    Upload Image
                </Button>
            </label>
            {isLoading && <LoadingSpinner sx={{ marginTop: 4 }} />}
            {imageUrl && <CardMedia component="img" image={imageUrl} alt="Uploaded Image" sx={{ maxWidth: 300, marginTop: 2 }} />}
            {imageCaption && <label>{imageCaption}</label>}
        </Box>
    );
}

export default App;
