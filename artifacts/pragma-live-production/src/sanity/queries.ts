const image = `
  asset->{
    _id,
    url,
    metadata { dimensions { width, height } }
  },
  hotspot
`;

export const homePageQuery = `{
  "home": *[_id == "home"][0]{
    sectionOrder,
    hero{
      eyebrow,
      titleLine1,
      titleLine2,
      copy,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel,
      secondaryCtaHref,
      consoleLocation,
      mosaic[]{ ${image} }
    },
    about{
      label,
      title,
      titleAccent,
      copy,
      points,
      image{ ${image} },
      alt,
      caption
    },
    capabilities{
      label,
      title,
      titleAccent,
      intro,
      items[]{ num, title, copy, icon }
    },
    work{
      label,
      title,
      titleAccent,
      statementLine1,
      statementLine2,
      cards[]{ kicker, title, copy, testId, image{ ${image} }, alt }
    },
    broadcast{
      label,
      title,
      titleAccent,
      intro,
      stations[]{ id, name, note }
    },
    gallery{
      label,
      title,
      titleAccent,
      photos[]{ image{ ${image} }, alt, caption }
    },
    method{
      label,
      title,
      titleAccent,
      intro,
      cue,
      steps[]{
        id,
        num,
        phase,
        title,
        copy,
        wide{ image{ ${image} }, caption },
        tall{ image{ ${image} }, caption },
        stills[]{ image{ ${image} }, caption }
      }
    },
    contact{
      eyebrow,
      title,
      titleAccent,
      note,
      form{
        heading,
        intro,
        submitLabel,
        submitHint,
        fields[]{ id, label, placeholder, hint, kind }
      }
    }
  },
  "settings": *[_id == "siteSettings"][0]{
    email,
    footerTagline,
    seoTitle,
    seoDescription,
    nav[]{ id, label }
  }
}`;
