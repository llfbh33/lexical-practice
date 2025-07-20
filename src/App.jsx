import { useState } from 'react';
import Editor from './components/Editor';
import View from './components/View';
import './App.css'

function App() {
  // const [mode, setMode] = useState('editor'); // 'editor' or 'view'
  const [editorState, setEditorState] = useState();
  // provide this state.  If not provided default to view mode only?
  const [isEditable, setIsEditable] = useState(true); // State to control editability

  return (
    <div>
      {/* {mode === 'editor' ? ( */}
        <Editor editorState={editorState} setEditorState={setEditorState} isEditable={isEditable} setIsEditable={setIsEditable} />
      {/* ) : (
        <View editorStateJsonString={editorState} setMode={setMode} />  // no longer necessary
      )} */}
    </div>
  );
}


export default App
