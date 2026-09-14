-- Enum additions must commit before the next migration uses them.
alter type public.document_status add value if not exists 'validating';
alter type public.document_status add value if not exists 'extracting';
alter type public.document_status add value if not exists 'cleaning';
alter type public.document_status add value if not exists 'structuring';
alter type public.document_status add value if not exists 'chunking';
alter type public.document_status add value if not exists 'saving';
alter type public.document_status add value if not exists 'unsupported';
