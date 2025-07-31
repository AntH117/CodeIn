import React from 'react';
import Icons from './icons/Icons';
import 'emoji-picker-element';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';


function EmojiPicker({ handleEmoji, darkMode }) {
    const pickerRef = React.useRef(null);
    React.useEffect(() => {
      const picker = pickerRef.current;
  
      if (picker) {
        const handle = (event) => handleEmoji(event.detail);
        picker.addEventListener('emoji-click', handle);
  
        // Cleanup when component unmounts
        return () => picker.removeEventListener('emoji-click', handle);
      }
    }, [handleEmoji]);
  
    return <emoji-picker ref={pickerRef} class={darkMode ? 'dark' : 'light'}></emoji-picker>;
  }

export default  function TextSettings({setFormData, darkMode}) {
    const [toggle, setToggle] = React.useState(false)
    const dropRef = React.useRef(null);


        function onClickOutside() {
            setToggle(false)
        }

        React.useEffect(() => {
            function handleClickOutside(event) {
              if (dropRef.current && !dropRef.current.contains(event.target)) {
                onClickOutside()
              }
            }
            document.addEventListener("click", handleClickOutside);
            //Clean up function
            return () => {
              document.removeEventListener("click", handleClickOutside);
            };
          }, [onClickOutside]);

          function handleEmoji(event) {
            const emoji = event.unicode
            setFormData((preVal) => {
                return {
                    ...preVal,
                    ['paragraph']: preVal.paragraph + emoji
                }
            }) 
        }
 
        return <div className={`text-settings`} ref={dropRef}>
            <div className='text-settings-emoji'>
                <div className='emoji-icon' onClick={() => setToggle((preVal) => !preVal)}>
                    <Icons.SmilingEmoji />
                </div>
                <div className='emoji-drop-down'>
                    {toggle && <EmojiPicker handleEmoji={handleEmoji} darkMode={darkMode}/>}
                </div>
            </div>
        </div>
    }