'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";

const DeleteButton = ({ handleOk, item, contentAuthor}) => {
    const loggedUser = useSelector(state => state?.user?.userDetails).user.id;
    const [visible, setVisible] = useState(false);

    const confirmDelete = async () => {
        setVisible(false);
        if (handleOk) await handleOk();
    };

    const cancelDelete = () => {
        setVisible(false);
    };

    if(loggedUser !== contentAuthor) return 

    return (
        <div>
            <Button
                className="btn small-btn"
                onClick={() => setVisible(true)}
            >
                Delete
            </Button>

            {visible && (
                <div className="overlay">
                <div className="modal-box">
                    <h3 className="title">Confirm Delete</h3>
                    <p className="subtitle">
                    {`Are you sure you want to delete this ${item ? item : "item"}?`}
                    </p>

                    <div className="row">
                    <button className="btn cancel" onClick={cancelDelete}>
                        Cancel
                    </button>

                    <button className="btn ok" onClick={confirmDelete}>
                        Delete
                    </button>
                    </div>
                </div>
                </div>
            )}

            <style>{`
                .delete-button {
                    padding: 10px;
                    background-color: #ff4d4d;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    color: #fff;
                    font-weight: bold;
                    font-size: 16px;
                }

                .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    z-index: 9999;
                }

                .modal-box {
                    width: 90%;
                    max-width: 400px;
                    background: #fff;
                    border-radius: 12px;
                    padding: 20px;
                }

                .title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 10px;
                }

                .subtitle {
                    text-align: center;
                    margin-bottom: 20px;
                    color: #333;
                    font-size: 14px;
                }

                .row {
                    display: flex;
                    justify-content: space-between;
                }

                .btn {
                    flex: 1;
                    padding: 10px 20px;
                    border-radius: 8px;
                    margin: 0 5px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                }

                .cancel {
                    background: #e5e5e5;
                    color: #333;
                }

                .ok {
                    background: #ff4d4d;
                    color: #fff;
                }
            `}</style>
        </div>
    );
};

export default DeleteButton;
