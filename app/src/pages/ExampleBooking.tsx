import { useState } from "react";
import { Button, DatePicker, Modal, Popup, RadioCards, Textarea } from "FrameUI";

const TIME_OPTIONS = [
  { value: "10:00", label: "10:00", description: "Morning slot" },
  { value: "13:00", label: "13:00", description: "Midday slot" },
  { value: "16:00", label: "16:00", description: "Afternoon slot" },
];

export function ExampleBooking() {
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleConfirm = () => {
    setIsModalOpen(false);
    setIsPopupOpen(true);
  };

  return (
    <div className="demo-page">
      <header className="demo-page-header">
        <h2>Booking</h2>
        <p className="demo-muted">
          Reserve a slot with DatePicker, RadioCards, and Modal confirmation.
        </p>
      </header>

      <section className="demo-section">
        <div className="demo-grid">
          <div className="demo-card">
            <h3>Select a date</h3>
            <div className="preview-date-picker">
              <DatePicker.Root value={date} onValueChange={setDate} locale="ko-KR" />
            </div>
          </div>
          <div className="demo-card">
            <h3>Select a time</h3>
            <RadioCards
              value={time}
              onValueChange={setTime}
              name="booking-time"
              options={TIME_OPTIONS}
            />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h3>Special requests</h3>
        <Textarea
          placeholder="Add notes for the host."
          minRows={2}
          maxRows={4}
          value={notes}
          onValueChange={setNotes}
        />
      </section>

      <div className="demo-actions">
        <Button label="Review booking" onClick={() => setIsModalOpen(true)} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Confirm booking"
        description="Please double-check your selections."
        footerSlot={
          <div className="demo-actions">
            <Button label="Cancel" onClick={() => setIsModalOpen(false)} />
            <Button label="Confirm" onClick={handleConfirm} />
          </div>
        }
      >
        <div className="demo-summary">
          <p>Date: {date ? date.toLocaleDateString() : "Not selected"}</p>
          <p>Time: {time}</p>
          <p>Notes: {notes || "None"}</p>
        </div>
      </Modal>

      <Popup
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        message="Booking confirmed."
        type="success"
        duration={2500}
      />
    </div>
  );
}
