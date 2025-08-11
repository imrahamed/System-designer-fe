import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

function DesignerPage() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw />
    </div>
  )
}

export default DesignerPage;
