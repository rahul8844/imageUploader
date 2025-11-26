import React, { useContext } from "react"
import { List, type RowComponentProps } from "react-window"
import { FileDropContext } from "../../FileUploaderContext/FileDropContextWrapper"
import FileCard from "./FileCard";

const COLUMN_COUNT = 3;

const FilesList: React.FC = () => {
  const { uploadedFiles } = useContext(FileDropContext);

  const CellComponent = ({ index, style }: RowComponentProps) => {
    const rowItems = uploadedFiles.slice(index * COLUMN_COUNT, (index + 1) * COLUMN_COUNT);
    return (
      <div style={{ ...style, height: '100%' }} className="uploaded-files-grid">
        {rowItems.map((file, columnIndex) => (
          <FileCard key={columnIndex} file={file} />
        ))}
      </div>
    )
  }

  return (
    <List
      rowProps={{ uploadedFiles }}
      rowComponent={CellComponent}
      rowHeight={350}
      rowCount={Math.ceil((uploadedFiles.length / COLUMN_COUNT))}
    />
  )
};

export default FilesList;