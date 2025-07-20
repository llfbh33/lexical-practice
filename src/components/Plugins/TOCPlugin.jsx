// TOCPlugin.jsx
import { useCallback, useEffect, useState, useRef } from 'react'; // <-- Added useRef
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
// ... (other imports like $createRangeSelection, $setSelection)


// there is a lexicalTableOfContents plugin, but it has bugs currently and not working properly,
// was able to quickly wrap together a custom one with help of genini.  Need to review it more later


const TOCPlugin = ({ inputEditor }) => {
    
    let editorInstance = inputEditor 
      if (!editorInstance) {
        const [contextEditor] = useLexicalComposerContext();
        editorInstance = contextEditor;
      }

    // console.log('editorInstance', editorInstance);
    const [tocHeadings, setTocHeadings] = useState([]);
    // Use a ref to store the latest headings for comparison, avoiding it as a useEffect dependency
    const latestTocHeadingsRef = useRef([]); // <--- NEW REF

    const getHeadingsFromEditor = useCallback(() => {
        const currentHeadings = [];
        editorInstance.getEditorState().read(() => {
            const root = $getRoot();
            const children = root.getChildren();

            for (const child of children) {
                if ($isHeadingNode(child)) {
                    const tag = child.getTag();
                    const textContent = child.getTextContent();
                    const key = child.getKey(); // Keep key for scrolling later
                    currentHeadings.push({ key, textContent, tag });
                }
            }
        });
        return currentHeadings;
    }, [editorInstance]); // Dependency: editorInstance

    useEffect(() => {
        // Initial load of TOC
        const initialHeadings = getHeadingsFromEditor();
        setTocHeadings(initialHeadings);
        latestTocHeadingsRef.current = initialHeadings; // Initialize ref with current headings

        // Register update listener to refresh TOC when editor state changes
        const removeUpdateListener = editorInstance.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const newHeadings = getHeadingsFromEditor();

                // Create comparable versions without the dynamic Lexical 'key' for stable comparison
                const newHeadingsComparable = newHeadings.map(({ textContent, tag }) => ({ textContent, tag }));
                const oldHeadingsComparable = latestTocHeadingsRef.current.map(({ textContent, tag }) => ({ textContent, tag }));

                // Only update state if the meaningful content of headings has changed
                if (JSON.stringify(newHeadingsComparable) !== JSON.stringify(oldHeadingsComparable)) {
                    setTocHeadings(newHeadings); // Update state with full headings (including keys)
                    latestTocHeadingsRef.current = newHeadings; // Update ref for next comparison
                }
            });
        });

        return () => {
            removeUpdateListener(); // Clean up listener
        };
    }, [editorInstance, getHeadingsFromEditor]); 

    const scrollToHeading = useCallback((key) => {
        const domElement = editorInstance.getElementByKey(key);
        // console.log('domElement', domElement);
        if (domElement) {
          
            domElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [editorInstance]);

    // console.log('tocHeadings', tocHeadings);

    return (
        <nav>
            <h3>Table of Contents</h3>
            <ul>
                {(tocHeadings ?? []).length === 0 && <li>No headings found.</li>}
                {(tocHeadings ?? []).map((heading) => (
                    <li key={heading.key} style={{ marginLeft: `${(parseInt(heading.tag.substring(1)) - 1) * 15}px` }}>
                        <a href={`#${heading.key}`} onClick={(e) => {
                            e.preventDefault();
                            scrollToHeading(heading.key);
                        }}>
                            {heading.textContent}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
export default TOCPlugin;