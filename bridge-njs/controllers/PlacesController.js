const PlacesController = {
  // Find autism-related resources by coordinates (nearby) or by place text
  async search(req, res, next) {
    try {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          message:
            "Google Places API key is missing (set GOOGLE_PLACES_API_KEY)",
        });
      }

      const { lat, lng, place, radius } = req.query;
      const keyword =
        req.query.keyword ||
        "autism services ABA therapy speech therapy occupational therapy";
      let url;
      const hasPlaceQuery = !!(place || req.query.q);
      const searchRadius = radius || 80467; // default ~50 miles

      if (hasPlaceQuery) {
        // City/state/zip query (with optional radius/location bias)
        const targetPlace = place || req.query.q;
        url = new URL(
          "https://maps.googleapis.com/maps/api/place/textsearch/json"
        );
        url.searchParams.set("query", `${keyword} in ${targetPlace}`);
        url.searchParams.set("key", apiKey);
        if (lat && lng) {
          url.searchParams.set("location", `${lat},${lng}`);
          url.searchParams.set("radius", searchRadius);
        } else if (radius) {
          url.searchParams.set("radius", searchRadius);
        }
      } else if (lat && lng) {
        // Radius around coordinates
        url = new URL(
          "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        );
        url.searchParams.set("keyword", keyword);
        url.searchParams.set("location", `${lat},${lng}`);
        url.searchParams.set("radius", searchRadius);
        url.searchParams.set("key", apiKey);
      } else {
        return res.status(400).json({
          message: "Provide either a place query (city/state/zip) or lat/lng",
        });
      }
      // console.log(url);

      const response = await fetch(url);
      if (!response.ok) {
        return res
          .status(502)
          .json({ message: "Failed to reach Google Places API" });
      }

      const data = await response.json();
      if (
        data.status &&
        data.status !== "OK" &&
        data.status !== "ZERO_RESULTS"
      ) {
        return res.status(502).json({
          message: `Google Places error: ${data.status}`,
          details: data.error_message,
        });
      }

      const places = (data.results || []).map((item) => ({
        id: item.place_id,
        name: item.name,
        address: item.formatted_address || item.vicinity,
        location: item.geometry?.location,
        rating: item.rating,
        userRatingsTotal: item.user_ratings_total,
        types: item.types,
        openNow: item.opening_hours?.open_now,
        googleMapsUri: `https://www.google.com/maps/place/?q=place_id:${item.place_id}`,
      }));

      res.json({ count: places.length, places });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = PlacesController;
