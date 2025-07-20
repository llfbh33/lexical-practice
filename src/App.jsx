import { useState } from 'react';
import Editor from './components/Editor';
import './App.css'

function App() {
  // editorState should be a state which will store the DB safe JSON string
  // If this is a new file the state can be empty
  // if it is not then the value should be the string pulled from the database record
  // this state can be updated to reside in the Editor, and an input state is provided, which will update this state
  // and the input state is only updated on save of the file
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
