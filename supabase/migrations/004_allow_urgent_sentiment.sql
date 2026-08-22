-- Keep the database constraint aligned with TicketSentiment in the backend.
-- Without this migration, tickets classified as "Urgent" fail on insert.
ALTER TABLE public.tickets
DROP CONSTRAINT IF EXISTS tickets_sentiment_check;

ALTER TABLE public.tickets
ADD CONSTRAINT tickets_sentiment_check
CHECK (sentiment IN ('Positive', 'Neutral', 'Urgent', 'Angry', 'Frustrated'));
