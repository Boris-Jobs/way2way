import React, { useRef } from 'react';

const Trash = () => {
    const fileInputRef = useRef(null);

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("Selected file:", file);
            alert("Upload successful!");
            // 这里可以添加处理文件的逻辑
        }
    };

    // 使用 useEffect 模拟 componentDidMount
    React.useEffect(() => {
        handleUploadClick();
    }, []);

    return (
        <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
        />
    );
};

export default Trash;
