import { DefaultServerCellComponentProps } from 'payload'

export const ContactNumberCell = async ({ cellData }: DefaultServerCellComponentProps) => {
  const getRemainingCount = () => {
    if (cellData.length > 1) {
      return (
        <span style={{ background: '#ccc', borderRadius: 5, padding: 2, fontSize: 10 }}>
          +{cellData.length - 1}
        </span>
      )
    }
  }
  if (cellData.length) {
    return (
      <div>
        {cellData[0].contactNumber} {getRemainingCount()}
      </div>
    )
  }
}
