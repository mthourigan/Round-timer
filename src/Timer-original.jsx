import React from 'react';
import './Timer.css';

function Timer() {

  return (
    <div className='timer-body'>
        <div className='controls-top'>
            <div className='duration-input'>
                <label for="workduration">Work duration</label>
                <input className='work-minutes' type='number' placeholder="00" ></input>
                <input className='work-seconds' type='number' placeholder="00" ></input>
            </div>
            <div className='duration-input'>
                <label for="breakduration">Break duration</label>
                <input className='break-minutes' type='number' placeholder="00"></input>
                <input className='break-seconds' type='number' placeholder="00"></input>
            </div>
            <div className='iterations'>
                <span>infinite?</span>
                <input type="checkbox" />
                <input className='round-count' type="number" placeholder='00' />
            </div>
        </div>

        <div className='clock'>
            <div className='minutes'>
                <button>up</button>
                <h1 className='minute-count'>00</h1>
                <button>down</button>
            </div>
            <div className='seconds'>
                <button>up</button>
                <h1 className='second-count'>00</h1>
                <button>down</button>
            </div>
            <div className='milliseconds'>
                <p className='second-count'>00</p>
            </div>
        </div>

        <div className='controls-bottom'>
            <div>
                <button>Start/Pause</button>
                <button>Reset</button>
            </div>
        </div>

    </div>

  );
}

export default Timer;
