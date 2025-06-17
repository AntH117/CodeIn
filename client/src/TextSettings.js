import React from 'react';
import Icons from './icons/Icons';
import 'emoji-picker-element';

export default  function TextSettings({setFormData}) {
    const [toggle, setToggle] = React.useState(false)
    const dropRef = React.useRef(null);
    
    
    function EmojiPicker({ handleEmoji }) {
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
      
        return <emoji-picker ref={pickerRef} class="light"></emoji-picker>;
      }
        function handleEmoji(event) {
            const emoji = event.unicode
            setFormData((preVal) => {
                return {
                    ...preVal,
                    ['paragraph']: preVal.paragraph + emoji
                }
            }) 
        }

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
 
        return <div className={`text-settings`} ref={dropRef}>
            <div className='text-settings-emoji'>
                <div className='emoji-icon' onClick={() => setToggle((preVal) => !preVal)}>
                    <Icons.SmilingEmoji />
                </div>
                <div className='emoji-drop-down'>
                    {toggle && <EmojiPicker handleEmoji={handleEmoji}/>}
                </div>
            </div>
        </div>
    }