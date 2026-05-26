import { useState } from "react";
import { Button, Carousel, Modal, Pagination, Tabs } from "FrameUI";

const PRODUCT_SLIDES = ["Front view", "Side view", "Detail", "In use"];

export function ExampleStorefront() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(2);

  return (
    <div className="demo-page">
      <header className="demo-page-header">
        <h2>Storefront</h2>
        <p className="demo-muted">
          Product detail layout with FrameUI Carousel, Tabs, and Pagination.
        </p>
      </header>

      <section className="demo-section">
        <div className="demo-grid">
          <div className="demo-card">
            <h3>Gallery</h3>
            <Carousel defaultIndex={0} aria-label="Product gallery" className="demo-carousel">
              <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
              <Carousel.Viewport>
                <Carousel.Track>
                  {PRODUCT_SLIDES.map((label) => (
                    <Carousel.Slide key={label}>{label}</Carousel.Slide>
                  ))}
                </Carousel.Track>
              </Carousel.Viewport>
              <Carousel.NextTrigger>›</Carousel.NextTrigger>
              <div className="carousel-indicators" role="tablist" aria-label="Slide select">
                {PRODUCT_SLIDES.map((label, index) => (
                  <Carousel.Indicator
                    key={label}
                    index={index}
                    aria-label={`Go to ${label}`}
                  />
                ))}
              </div>
            </Carousel>
          </div>

          <div className="demo-card">
            <h3>Minimal speaker</h3>
            <p className="demo-muted">Portable audio with a clean, headless UI.</p>
            <div className="demo-row">
              <span>Price</span>
              <strong>$149</strong>
            </div>
            <div className="demo-actions">
              <Button label="Add to cart" onClick={() => setIsModalOpen(true)} />
              <Button label="Notify me" onClick={() => setIsModalOpen(true)} />
            </div>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h3>Details</h3>
        <Tabs.Root defaultValue="details" className="demo-tabs">
          <Tabs.List className="demo-tabs-list">
            <Tabs.Trigger value="details">Details</Tabs.Trigger>
            <Tabs.Trigger value="shipping">Shipping</Tabs.Trigger>
            <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="details" className="demo-tabs-content">
            Clean profile, 12-hour battery, and USB-C charging.
          </Tabs.Content>
          <Tabs.Content value="shipping" className="demo-tabs-content">
            Ships in 2-3 business days. Returns accepted within 30 days.
          </Tabs.Content>
          <Tabs.Content value="reviews" className="demo-tabs-content">
            “Minimal and loud.” – 128 reviews
          </Tabs.Content>
        </Tabs.Root>
      </section>

      <section className="demo-section">
        <h3>Related items</h3>
        <Pagination
          page={page}
          totalPages={8}
          onPageChange={setPage}
          siblingCount={1}
          boundaryCount={1}
          className="demo-pagination"
        >
          <Pagination.Prev>Prev</Pagination.Prev>
          <Pagination.List />
          <Pagination.Next>Next</Pagination.Next>
        </Pagination>
      </section>

      <Modal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Added to cart"
        description="1 item in your cart."
        footerSlot={
          <div className="demo-actions">
            <Button label="Continue shopping" onClick={() => setIsModalOpen(false)} />
            <Button label="Checkout" onClick={() => setIsModalOpen(false)} />
          </div>
        }
      >
        <p>Minimal speaker · $149</p>
      </Modal>
    </div>
  );
}
