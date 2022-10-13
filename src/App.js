import { useState, useMemo, useEffect } from 'react'
import { FilesViewer } from './FilesViewer'

const fs = window.require('fs')
const path = window.require('path')

const { app } = window.require('@electron/remote')

function App() {
  const targetExt = '.json'
  const [startPath, setStartPath] = useState('/Users/howangleung/IdeaProjects')

  const [targetFiles, setTargetFiles] = useState([])
  const [value, setValue] = useState('howang')

  const [updated, setUpdated] = useState(false)

  const fromDir = (startPath, filter) => {
    if (!fs.existsSync(startPath)) {
      console.log('no dir ', startPath)
      return
    }

    const dirCont = fs.readdirSync(startPath)
    for (var i = 0; i < dirCont.length; i++) {
      var filename = path.join(startPath, dirCont[i])
      var stat = fs.lstatSync(filename)

      if (stat.isDirectory()) {
        fromDir(filename, filter) //recurse
      } else if (filename.endsWith(filter)) {
        if (!targetFiles.includes(filename)) {
          const newTargetFiles = [...targetFiles]
          newTargetFiles.push(filename)
          setTargetFiles(state => [...state, ...newTargetFiles])
        }
      }
    }
  }

  useEffect(() => {
    if (targetFiles === null || targetFiles.length === 0) {
      fromDir(startPath, targetExt)
    }
  }, [targetFiles])

  useEffect(() => {
    fromDir(startPath, targetExt)
    return () => {}
  }, [startPath])

  useEffect(() => {

    setTargetFiles([])
    // fromDir(startPath, targetExt)
  }, [updated])

  const handleRename = file => {
    let filePath = file.split('.')[0]
    let fileExt = '.' + file.split('.')[1]
    let newFilename = `${filePath}-${value}${fileExt}`
    fs.rename(file, newFilename, function (err) {
      if (err) console.log('ERROR: ' + err)
    })

    let newTargetFiles = targetFiles
    newTargetFiles = newTargetFiles.map(d => {
      if (d === file) {
        d = newFilename
      }
      return d
    })
    setTargetFiles(newTargetFiles)
  }

  if (targetFiles.length > 0) {
    targetFiles.forEach((originalDir, i) => {
      fs.watch(path.parse(originalDir).dir, function (event, filename) {
        if (filename) {
          setTargetFiles([])
        } else {
          console.log('filename not provided')
        }
      })
    })
  }

  return (
    <div className="container mt-2">
      <div className="row justify-content-center align-items-center g-2">
        <div className="mb-3">
          <label htmlFor="" className="form-label">
            Value to Append
          </label>
          <input
            onChange={e => {
              setValue(e.target.value)
            }}
            type="text"
            className="form-control"
            name=""
            id=""
            aria-describedby="helpId"
            placeholder=""
            value={value}
          />
          {/* <small id="helpId" class="form-text text-muted">Help text</small> */}
        </div>
      </div>

      {targetFiles.map(file => {
        return (
          <div
            key={file}
            className="w-100 d-flex flex-row justify-content-start align-items-center g-2"
          >
            <li className="w-100 mt-2 list-group-item">{file}</li>
            <button
              onClick={() => handleRename(file)}
              className="btn mt-2 btn-primary"
            >
              RENAME
            </button>
          </div>
        )
      })}

      {/* <h4>{path}</h4>
      <h1>HELLO WORLD</h1>
      <div className="form-group mt-4 mb-2">
        <input
          value={searchString}
          onChange={event => setSearchString(event.target.value)}
          className="form-control form-control-sm"
          placeholder="File search"
        />
      </div>
      <FilesViewer files={filteredFiles} onBack={onBack} onOpen={onOpen} /> */}
    </div>
  )
}

export default App
