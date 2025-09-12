--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.interactions DROP CONSTRAINT IF EXISTS interactions_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.interactions DROP CONSTRAINT IF EXISTS interactions_pkey;
ALTER TABLE IF EXISTS ONLY public.creators DROP CONSTRAINT IF EXISTS creators_pkey;
DROP TABLE IF EXISTS public.interactions;
DROP TABLE IF EXISTS public.creators;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: creators; Type: TABLE; Schema: public; Owner: BD
--

CREATE TABLE public.creators (
    id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(255),
    social_handles jsonb DEFAULT '{}'::jsonb,
    instagram character varying(255),
    tiktok character varying(255),
    youtube character varying(255),
    twitter character varying(255),
    primary_content_type character varying(255),
    audience_size integer DEFAULT 0,
    engagement_rate double precision DEFAULT '0'::double precision,
    contact_date timestamp with time zone,
    source_of_contact character varying(255),
    potential_projects jsonb DEFAULT '[]'::jsonb,
    notes text,
    tags character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    verified boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.creators OWNER TO "BD";

--
-- Name: interactions; Type: TABLE; Schema: public; Owner: BD
--

CREATE TABLE public.interactions (
    id uuid NOT NULL,
    creator_id uuid NOT NULL,
    interaction_type character varying(255) NOT NULL,
    date timestamp with time zone NOT NULL,
    project_context character varying(255),
    notes text,
    potential_fit_score integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.interactions OWNER TO "BD";

--
-- Data for Name: creators; Type: TABLE DATA; Schema: public; Owner: BD
--

COPY public.creators (id, full_name, email, phone, social_handles, instagram, tiktok, youtube, twitter, primary_content_type, audience_size, engagement_rate, contact_date, source_of_contact, potential_projects, notes, tags, verified, created_at, updated_at) FROM stdin;
d0ec5e09-b6c7-4d09-a3ab-c32dff6fb7e1	April Kae	april@april-kae.com	\N	{"tiktok": "@aprilkae_", "youtube": "@aprilkaemusic", "facebook": "@aprilkaemusic", "instagram": "@aprilkae"}	aprilkae	aprilkae_	aprilkaemusic	\N	Music	762500	5	2025-09-11 10:04:59.507-04	Excel Import	["music collaboration", "brand soundtrack", "content partnership", "brand campaign"]	Music/Bass/Daily - April stays inspired by posting multiple bassist renditions daily, creating a ton of content from it.. Platform focus: TT & YT . Location: Los Angeles, US	{tiktok,youtube,music,content-creator}	t	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
0224e2e7-0dfe-42dc-ba01-6136e99dfac0	Joe Tasker	Si@sharpergrp.com	\N	{"tiktok": "@joetasker", "youtube": "@JoeTasker", "facebook": "@mrjoetasker", "instagram": "@taskerjoe"}	taskerjoe	joetasker	JoeTasker	\N	Comedy & Humor	729000	3.7	2025-09-11 10:04:59.507-04	Excel Import	["content partnership", "brand campaign", "trend analysis", "viral content"]	Content/Trends/Cultural - UK creator capturing the mood of the moment with content based on trends, topics of interest, all with cultural insight.. Platform focus: TT & YT . Location: UK	{tiktok,youtube,comedy,trending,culture,content-creator}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
3b67c29a-9a3f-4318-b259-88c06e67bd61	NDA	ndainternetbusiness@gmail.com	\N	{"tiktok": "@ndainternet", "youtube": "@ndainternet", "facebook": "@ndaoffline", "instagram": "@ndainternet"}	ndainternet	ndainternet	ndainternet	\N	Entertainment	1200000	4.9	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Business/Money/Education - UK creator educating people on business and money topics, \nperfect for giving advice on running and growing a small business as a creator.. Platform focus: TT & YT . Location: Leamington Spa, Warwickshire	{tiktok,youtube}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
12a304fd-eda7-4f92-bca5-73030e2b41ae	Spence Taylor	connectwithspencetaylor@gmail.com	\N	{"tiktok": "@iamspencetaylor ", "youtube": "@spencetaylor ", "facebook": "@iamspencetaylor", "instagram": "@spencetaylor "}	spencetaylor 	iamspencetaylor 	spencetaylor 	\N	Comedy & Humor	1500000	2.8	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Astrology/Entertainment/Hooks - US creator serving up zodiac roasts and \nhoroscope advice, all with great hooks and bold original soundtracks.. Platform focus: TT & YT . Location: Miami, Fl	{tiktok,youtube}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
f5a4cd61-7eaf-40fe-b3c2-2d31ba66fc27	Mr Cian Twomey	\N	\N	{"tiktok": "@mrciantwomey", "youtube": "@MrCianTwomey", "facebook": "@MrCianTwomey", "instagram": "@mrciantwomey"}	mrciantwomey	mrciantwomey	MrCianTwomey	\N	Comedy & Humor	5900000	3.8	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Comedy/Characters/Skits - Comedian who creates multiple characters \nbeyond  using filters, producing skits featuring various personas.. Platform focus: TT & YT . Location: Ireland	{tiktok,youtube,comedy}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
376bc0d9-a23d-4aac-8f3e-c80acad9cef8	miranda sanchez	miranda@kensingtongrey.co	\N	{"tiktok": "@siranda_manchez", "youtube": "@siranda_manchez", "facebook": "@Sirandamanchez", "instagram": "@siranda_manchez"}	siranda_manchez	siranda_manchez	siranda_manchez	\N	Fashion & Style	316000	7.5	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Lifestyle/Influencer/Editing - Miranda quit her job this year to become a \nfull-time influencer and has yet to make her way over to Facebook. \nShe's already built an established editing style that keeps her Instagram following engaged.. Platform focus: TT & YT . Location: NYC, US	{tiktok,youtube}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
c043077c-8090-42a0-8341-b6b1049f320f	Imogen Andrews	cara@elryagency.co.uk	\N	{"tiktok": "@imogenaisha", "youtube": "@imogenandrewscomedy", "facebook": "Imogen Andrews", "instagram": "@imogenandrewscomedy"}	imogenandrewscomedy	imogenaisha	imogenandrewscomedy	\N	Comedy & Humor	407900	7.9	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Comedy/TikTok/Facebook - UK comedian with established TikTok following and growing audience on Facebook. Plenty of fun outtakes in her scripts that could be used.. Platform focus: TT & YT . Location: UK	{tiktok,youtube}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
adcaf55a-28b0-4999-b534-9c5c55a38d29	Jérémy Nicollin	bookings@empirexus.com	\N	{"tiktok": "@jeremynicollin", "youtube": "@nicollinjeremy", "facebook": "@NicollinJeremy", "instagram": "@jeremynicollin"}	jeremynicollin	jeremynicollin	nicollinjeremy	\N	Entertainment	1300000	3.8	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Creative/Cinematography/Reveals - French creator producing elaborately shot videos with plenty of different camera angles to show the setup and the shocking result.. Platform focus: TT & YT . Location: Saint-Claude, France	{tiktok,youtube}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
b3b5fbac-ff48-4866-a374-fdec7d1336f4	Mama Still Got It	info@mamastillgotit.com	\N	{"tiktok": "@mamastillgotit_", "youtube": "@mamastillgotit_", "facebook": "@mamastillgotitblog", "instagram": "@mamastillgotit_"}	mamastillgotit_	mamastillgotit_	mamastillgotit_	\N	Comedy & Humor	830000	6.9	2025-09-11 10:04:59.507-04	Excel Import	["content partnership", "brand campaign"]	Lifestyle/Parenting/Reality - UK creator with 34% young adult audience on TikTok, talking about reality of being a content creator and a mother.. Platform focus: TT & YT . Location: London, United Kingdom	{tiktok,youtube,content-creator}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
d63fec1d-9194-4369-8122-ea0d0d7228ae	BrandonB	brandon@studiob.net	\N	{"tiktok": "@brandonb", "youtube": "@brandonbaum123", "facebook": "@brandnbaum", "instagram": "@brandonb"}	brandonb	brandonb	brandonbaum123	\N	General Content	16000000	4.3	2025-09-11 10:04:59.507-04	Excel Import	["content partnership", "brand campaign"]	VFX/Illusions/Entertainment - Brandon B's content focuses on visual arts and \nentertainment. He provides an inside look at visual effects and \nhow they are constructed with trippy visuals.. Platform focus: TT & YT . Location: London, United Kingdom	{tiktok,youtube,content-creator}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
1263d453-d224-467b-89ce-7516fb53fe3c	Youneszarou	totally@atlasgames.de	\N	{"tiktok": "@youneszarou", "youtube": "@YounesZarou", "facebook": "@Youneszarouofficial", "instagram": "@youneszarou"}	youneszarou	youneszarou	YounesZarou	\N	Comedy & Humor	56900000	5	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Reactions/Skits/Lifestyle - Younes Zarou is a creator whose videos span across\n reacting to funny videos, transforming himself into characters, house tours, \nfashion and more. His versatile approach has got him over 4m followers on \nFacebook.. Platform focus: TT & YT . Location: Germany	{tiktok,youtube}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
1d929bd7-bc71-4672-8d31-39d33ec52792	27 Travels	27travels@gmail.com	\N	{"tiktok": "@27travels", "youtube": "@27travels", "facebook": "@27travels", "instagram": "@27travels"}	27travels	27travels	27travels	\N	Travel & Adventure	115700	7	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Travel/Adventure/Monetization - Travel bloggers exploring the world and making money off their favorite hobby.. Platform focus: TT & YT . Location: Brooklyn, US	{tiktok,youtube}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
d997c891-7e22-49c4-bef9-fc9c722474be	adventureswithamina	amina@season25.com	\N	{"tiktok": "@adventureswithamina", "youtube": "@adventureswithamina", "facebook": "n/a", "instagram": "@adventureswithamina"}	adventureswithamina	adventureswithamina	adventureswithamina	\N	Travel & Adventure	230000	3.7	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Travel/Cinematography/Hiking - Amina Hassan creates cinematic solo hiking and camping videos across the UK, using drones to capture stunning footage of places like Snowdonia and Welsh wilderness.. Platform focus: TT & YT . Location: 	{tiktok,youtube}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
6a649d61-3eae-4804-8724-69cd642f15a2	Neon Wrangler	neonwrangler1@gmail.com	\N	{"tiktok": "@neonwrangler", "youtube": "n/a", "facebook": "Neon Wrangler", "instagram": "@Neonwrangler"}	Neonwrangler	neonwrangler	n/a	\N	Fashion & Style	114000	7.5	2025-09-11 10:04:59.507-04	Excel Import	["content partnership", "brand campaign"]	Fashion/Western/Styling - Neon Wrangler is a western fashion creator from Georgia who brings bright, colorful vibes to traditional cowgirl style. With 114.5K Instagram followers, she shares rodeo fashion tips and western styling content.. Platform focus: TikTok. Location: Georgia, US	{content-creator}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
d9dca0f5-c2ae-4583-984a-7e5fb996d0bc	Cody Taurus	codyandtaurus@gmail.com	\N	{"tiktok": "@cody.taurus", "youtube": "@codytaurus", "facebook": "@codyandTaurus", "instagram": "@cody.taurus"}	cody.taurus	cody.taurus	codytaurus	\N	Comedy & Humor	1100000	4.6	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Comedy/Skits/Pets - Cody Taurus's videos are mainly skit scenario based \ncomedy videos, many featuring his adorable dog who stars in many videos \nalongside him.. Platform focus: TT & YT . Location: US	{tiktok,youtube}	t	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
ecb41d8c-e445-4791-872b-61227d1727c0	Michelle Khare	michellekhare+business@gmail.com	\N	{"tiktok": "@michellekhare", "youtube": "@michellekhare", "facebook": "@officialmichellekhare", "instagram": "@michellekhare"}	michellekhare	michellekhare	michellekhare	\N	Entertainment	5220000	3.8	2025-09-11 10:04:59.507-04	Excel Import	["brand partnership", "content collaboration"]	Stunts/Challenges/Extreme - Michelle Khare's videos are mostly based on her \naccepting challenges to do the most extreme things like hanging off a Hollywood \nsign or doing crash stunts. She's also built a massive YouTube following.. Platform focus: . Location: US	{}	t	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
0ddf60dd-9264-4896-82bc-0a949cc8b797	Gatlin Didier	barxapparel@gmail.com	\N	{"tiktok": "@gatlin_didier", "youtube": "@GatlinDidier", "facebook": "@GatlinDidier", "instagram": "@gatlin_didier"}	gatlin_didier	gatlin_didier	GatlinDidier	\N	Comedy & Humor	2400000	3.7	2025-09-11 10:04:59.508-04	Excel Import	["brand partnership", "content collaboration"]	Comedy/Farming/Characters - Gatlin Didier is the fifth-generation Oklahoma rancher who's made farm life comedy go viral with his "Darrell Bibbins" character.. Platform focus: . Location: Oklahoma, US	{}	t	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
8e958e83-7c07-4d62-b741-ad4d961c6c25	Tyra the Stitcher  (The Dessert Stitcher)	tyrathestitcher@gmail.com	\N	{"tiktok": "@tyra_the_stitcher", "youtube": "@Tyra_the_Stitcher", "facebook": "@tyra.the.stitcher", "instagram": "@tyra_the_stitcher"}	tyra_the_stitcher	tyra_the_stitcher	Tyra_the_Stitcher	\N	Fashion & Style	38000	6.5	2025-09-11 10:04:59.508-04	Excel Import	["brand partnership", "content collaboration"]	Crafts/Crochet/Colorful - Tyra is a crochet artist making colorful hats, \nscarves and ski masks with bright colorful accents. \nHer creations are inspired by everyday items.. Platform focus: . Location: Seattle, WA	{}	t	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
8f87e619-babc-45a9-b089-9919991fdc20	Anya Tisdale	anya@dead.center	\N	{"tiktok": "@anya.tisdale", "youtube": "@anya.tisdale", "facebook": "Anya Tisdale", "instagram": "@anya.tisdale"}	anya.tisdale	anya.tisdale	anya.tisdale	\N	Beauty & Lifestyle	153000	7.8	2025-09-11 10:04:59.508-04	Excel Import	["brand partnership", "content collaboration"]	Makeup/Cosplay/Art - Anya Tisdale is a makeup artist and cosplayer creating \nintricate and alternative makeup looks. Her approach blends art and beauty.. Platform focus: . Location: NYC, US	{}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
d4f1c3ae-f5bf-417d-9674-5d375ef74dc1	Cybr Grl	cybrgrl@icloud.com	\N	{"tiktok": "@cybr.grl", "youtube": "@cybrgrl", "facebook": "@itmecybrgrl", "instagram": "@cybr.grl"}	cybr.grl	cybr.grl	cybrgrl	\N	Beauty & Lifestyle	3500000	3.9	2025-09-11 10:04:59.508-04	Excel Import	["brand partnership", "content collaboration"]	Fashion/Maximalism/Aesthetic - Cybr Grl is a 'decora' creator who celebrates all \nthings maximalism with her clothes, hair and makeup. \nShe's often dressed in hundreds of accessories and is popular for her get\n 'unready with me' videos.. Platform focus: . Location: US	{}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
99c82907-7a1b-4256-82f3-1aecae86180e	Pat Smith	patsmithcomedy@gmail.com	\N	{"tiktok": "patsmithcomedy", "youtube": "patsmithcomedy", "facebook": "patsmithcomedy", "instagram": "patsmithcomedy"}	patsmithcomedy	patsmithcomedy	patsmithcomedy	\N	Comedy & Humor	76800	8	2025-09-11 10:04:59.508-04	Excel Import	["brand partnership", "content collaboration"]	Comedy/Military/Stand-up - Ex-soldier turned comedian Pat Smith has swapped \nbarracks for the stage, armed with a sharp wit and a cheeky grin.\n A man clearly drawn to careers where avoiding bombs is key, \nPat has made waves in comedy since stepping up to the mic.. Platform focus: . Location: UK	{}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
3e3e30ba-a0ae-4760-b3f2-bc9bd9b57489	Kurt Tocci	\N	\N	{"tiktok": "", "youtube": "", "facebook": "KurtTocci", "instagram": ""}				\N	Travel & Adventure	1900000	3.1	2025-09-11 10:04:59.508-04	Excel Import	["content partnership", "brand campaign"]	Disney/Travel/Positivity - Kurt Tocci is best known for his \nDisney Quarantine video, he creates high-energy, positive content. \nHe's a member of the Smile Squad with a mission to inspire his "FAMBAM.". Platform focus: . Location: 	{content-creator}	f	2025-09-11 10:04:59.57-04	2025-09-11 10:04:59.57-04
d813a566-09ae-40b2-b9ef-a1f7a914e846	Test	test@test.com	6460000000	{"tiktok": "test", "twitter": "test", "youtube": "", "instagram": "test"}	test	test		test	Lifestyle	60	5	\N	Edinburgh Festival	[]		{"Micro Influencer"}	t	2025-09-11 10:10:35.522-04	2025-09-11 10:10:35.522-04
\.


--
-- Data for Name: interactions; Type: TABLE DATA; Schema: public; Owner: BD
--

COPY public.interactions (id, creator_id, interaction_type, date, project_context, notes, potential_fit_score, created_at, updated_at) FROM stdin;
\.


--
-- Name: creators creators_pkey; Type: CONSTRAINT; Schema: public; Owner: BD
--

ALTER TABLE ONLY public.creators
    ADD CONSTRAINT creators_pkey PRIMARY KEY (id);


--
-- Name: interactions interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: BD
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_pkey PRIMARY KEY (id);


--
-- Name: interactions interactions_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: BD
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT interactions_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.creators(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

