import React from 'react'
import classes from "./styles.module.css"

const Interests = ({interests}) => {
    return (
        <div className="formGroup">
            <label>Interests</label>
            <div className={classes["interests-container"]}>
                {interests.length ? <>
                    {interests.map((interest) => {
                        return (
                            <button
                                type="button"
                                key={interest.id}
                                className={`${classes['interest-item']} ${classes['selected']}`}
                                onClick={() => handleInterestToggle(interest.id)}
                            >
                                {interest.name}
                            </button>
                        );
                        })}
                </> :"No interests yet"}
            </div>
        </div>
    )
}

export default Interests