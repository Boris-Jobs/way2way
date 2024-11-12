import React, { Component } from 'react';

const fileIcons = {
    'application/pdf': 'path/to/pdf-icon.png', 
    'application/msword': 'path/to/word-icon.png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'path/to/word-icon.png', 
};

export class Calc extends Component {
    constructor() {
        super();
        this.state = {
            imageFiles: [],
            inputText: '',
            name: '',
            email: '',
            category: '',
            showConfirmation: false,
            submissionMessage: '',
            replaceIndex: null 
        };
        this.fileInputRef = React.createRef();
    }

    handleInputChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleAddAttachment = () => {
        if (this.state.imageFiles.length >= 3) {
            alert('You can upload a maximum of 3 files.');
        } else {
            this.fileInputRef.current.click();
        }
    }

    handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        this.setState(prevState => {
            let newFiles = [...prevState.imageFiles];
            if (this.state.replaceIndex !== null) {
                newFiles[this.state.replaceIndex] = files[0];
                this.setState({ replaceIndex: null });
            } else {
                newFiles = [...newFiles, ...files].slice(0, 3);
            }
            return { imageFiles: newFiles };
        });
    }

    handleRemoveFile = (index) => {
        this.setState(prevState => {
            const newFiles = [...prevState.imageFiles];
            newFiles.splice(index, 1);
            return { imageFiles: newFiles };
        });
    }

    handleReplaceFile = (index) => {
        this.setState({ replaceIndex: index }, () => {
            this.fileInputRef.current.click();
        });
    }

    handleSubmit = () => {
        this.setState({ showConfirmation: true });
    }

    handleConfirmation = (confirm) => {
        if (confirm) {
            this.setState({ submissionMessage: 'Submission successful!', showConfirmation: false });
        } else {
            this.setState({ showConfirmation: false });
        }
    }

    handleCancel = () => {
        this.setState({
            imageFiles: [],
            inputText: '',
            name: '',
            email: '',
            category: '',
            showConfirmation: false,
            submissionMessage: '',
            replaceIndex: null
        });
    }

    renderFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return <img src={URL.createObjectURL(file)} alt="Uploaded" className="w-full h-full object-cover" />;
        } else {
            const iconSrc = fileIcons[file.type] || 'path/to/default-icon.png'; // 默认图标路径
            return <img src={iconSrc} alt="File Icon" className="w-full h-full object-cover" />;
        }
    }

    render() {
        return (
            <div className="bg-ub-drk-abrgn h-full w-full text-white p-4 flex flex-col items-center"
                // style={{
                //     backgroundImage: 'url(./images/wallpapers/wall-feedback_original.jpg)',
                //     backgroundSize: 'cover',
                //     backgroundPosition: 'center',
                //     backgroundRepeat: 'no-repeat'
                // }}
            >
                {/* 网站名称 */}
                <div className="text-xs mb-2">
                    Way2Way HKU Campus Guide
                </div>
                <hr className="border-gray-500 w-full mb-4" />

                {/* 大标题 */}
                <h1 className="text-xl font-bold mb-2">
                    Find your way around campus
                </h1>

                {/* 小标题 */}
                <h2 className="text-lg mb-4">
                    User Feedback
                </h2>

                {/* 提示词 */}
                <p className="text-sm mb-4 text-center">
                    We are committed to providing quality service to our users. Your feedback is important to us. Please take a few minutes to complete the form below.
                </p>

                {/* Name 输入框 */}
                <input
                    type="text"
                    name="name"
                    value={this.state.name}
                    onChange={this.handleInputChange}
                    placeholder="Name"
                    className="border border-gray-500 rounded p-2 w-full max-w-md mb-2 bg-gray-700 text-white placeholder-gray-400"
                />

                {/* Email 输入框 */}
                <input
                    type="email"
                    name="email"
                    value={this.state.email}
                    onChange={this.handleInputChange}
                    placeholder="Email"
                    className="border border-gray-500 rounded p-2 w-full max-w-md mb-2 bg-gray-700 text-white placeholder-gray-400"
                />

                {/* Category 选择框 */}
                <select
                    name="category"
                    value={this.state.category}
                    onChange={this.handleInputChange}
                    className="border border-gray-500 rounded p-2 w-full max-w-md mb-4 bg-gray-700 text-white"
                >
                    <option value="" disabled>Please select</option>
                    <option value="Missing Route">Missing Route</option>
                    <option value="Incorrect Navigation">Incorrect Navigation</option>
                    <option value="Route Evaluation">Route Evaluation</option>
                    <option value="Traffic Changes">Traffic Changes</option>
                    <option value="Other">Other</option>
                </select>

                {/* 聊天输入框 */}
                <textarea
                    name="inputText"
                    className="border border-gray-500 rounded p-2 w-full max-w-md h-24 bg-gray-700 text-white placeholder-gray-400"
                    placeholder="Your feedback is important to us. Please feel free to leave your comments here."
                    value={this.state.inputText}
                    onChange={this.handleInputChange}
                />

                {/* 按钮和附件缩略图 */}
                <div className="flex mt-4 space-x-2 items-center">
                    <button
                        onClick={this.handleAddAttachment}
                        className="p-1 border border-gray-500 rounded bg-green-700 hover:bg-green-600 text-sm"
                    >
                        Add attachment
                    </button>
                    <input
                        type="file"
                        onChange={this.handleFileUpload}
                        ref={this.fileInputRef}
                        style={{ display: 'none' }}
                        multiple
                    />
                    <div className="flex space-x-2">
                        {[...Array(3)].map((_, index) => (
                            <div
                                key={index}
                                className="w-16 h-16 border border-gray-500 rounded relative flex items-center justify-center"
                                onClick={() => this.state.imageFiles[index] ? this.handleReplaceFile(index) : this.handleAddAttachment()}
                            >
                                {this.state.imageFiles[index] && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); this.handleRemoveFile(index); }}
                                            className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                                        >
                                            &minus;
                                        </button>
                                        {this.renderFileIcon(this.state.imageFiles[index])}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs truncate px-1">
                                            <span title={this.state.imageFiles[index].name}>
                                                {this.state.imageFiles[index].name}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 按钮 */}
                <div className="flex mt-4 space-x-2">
                    <button
                        onClick={this.handleCancel}
                        className="p-1 border border-gray-500 rounded bg-gray-500 hover:bg-gray-400 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={this.handleSubmit}
                        className="p-1 border border-gray-500 rounded bg-blue-700 hover:bg-blue-600 text-sm"
                    >
                        Submit
                    </button>
                </div>

                {/* 提交确认对话框 */}
                {this.state.showConfirmation && (
                    <div className="mt-4 bg-gray-700 p-4 rounded">
                        <p>Are you sure you want to submit?</p>
                        <div className="flex space-x-2 mt-2">
                            <button
                                onClick={() => this.handleConfirmation(true)}
                                className="p-1 border border-gray-500 rounded bg-blue-700 hover:bg-blue-600 text-sm"
                            >
                                YES
                            </button>
                            <button
                                onClick={() => this.handleConfirmation(false)}
                                className="p-1 border border-gray-500 rounded bg-red-700 hover:bg-red-600 text-sm"
                            >
                                NO
                            </button>
                        </div>
                    </div>
                )}

                {/* 提交成功消息 */}
                {this.state.submissionMessage && (
                    <div className="mt-4 text-green-500">
                        {this.state.submissionMessage}
                    </div>
                )}
            </div>
        );
    }
}

export default Calc;

export const displayTerminalCalc = (addFolder, openApp) => {
    return <Calc addFolder={addFolder} openApp={openApp}> </Calc>;
}
